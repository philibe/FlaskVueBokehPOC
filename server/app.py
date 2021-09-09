from flask import (
    Flask,
    jsonify,
    request,
    render_template,
    flash,
    redirect,
    url_for,
    session,
    send_from_directory,
    # abort,
)

from bokeh.layouts import row, column, gridplot, widgetbox

from flask_cors import CORS
import uuid
import os


from bokeh.embed import json_item
from bokeh.plotting import figure, curdoc
from bokeh.models.sources import AjaxDataSource, ColumnDataSource


from bokeh.models import CustomJS

# from bokeh.models.widgets import Div

bokeh_tool_tips = [
    ("index", "$index"),
    ("(x,y)", "($x, $y)"),
    # ("desc", "@desc"),
]

bokeh_tool_list = ['pan,wheel_zoom,lasso_select,reset']

import math
import json


from flask_debugtoolbar import DebugToolbarExtension

from werkzeug.utils import import_string

from werkzeug.serving import run_simple
from werkzeug.middleware.dispatcher import DispatcherMiddleware


def create_app(PROD, DEBUG):

    app = Flask(__name__)

    app.dir_app = os.path.abspath(os.path.dirname(__file__))
    app.app_dir_root = os.path.dirname(app.dir_app)
    app.app_dir_nom = os.path.basename(app.dir_app)

    print(app.dir_app)
    print(app.app_dir_root)
    print(app.app_dir_nom)

    if not PROD:
        CORS(app, resources={r'/*': {'origins': '*'}})
        template_folder = '../frontend/public'
        static_url_path = 'static'
        static_folder = '../frontend/public/static'

    else:
        template_folder = '../frontend/dist/'
        static_url_path = 'static'
        static_folder = '../frontend/dist/static'

    app.template_folder = template_folder
    app.static_url_path = static_url_path
    app.static_folder = static_folder

    # à rajouter
    # app.wsgi_app = ReverseProxied(app.wsgi_app, script_name='/' + app.app_dir_nom)

    app.debug = DEBUG

    app.config.from_pyfile('config.py')
    if DEBUG:
        toolbar = DebugToolbarExtension()
        toolbar.init_app(app)

    @app.before_first_request
    def initialize():
        session.clear()
        if not session.get('x'):
            session['x'] = 0
        if not session.get('y'):
            session['y'] = 0
        if not session.get('HistoryArray'):
            session['HistoryArray'] = [{'x': None, 'y': None}]

    @app.route('/')
    def index():
        VariableFlask = 'VariableFlaskRendered'
        return render_template('index.html', VariableFlask=VariableFlask)

    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/x-icon')

    @app.route('/static/plugins_node_modules/<path:path>')
    def send_plugins_(path):
        print(app.app_dir_root)
        print(os.path.join(app.app_dir_root, 'frontend', 'node_modules'))
        return send_from_directory((os.path.join(app.app_dir_root, 'frontend', 'node_modules')), path)

    # https://stackoverflow.com/questions/37083998/flask-bokeh-ajaxdatasource
    # https://github.com/bokeh/bokeh/blob/main/examples/embed/json_item.py

    @app.route("/api/datasinus/<operation>", methods=['GET', 'POST'])
    def get_x(operation):
        if not session.get('x'):
            session['x'] = 0
        if not session.get('y'):
            session['y'] = 0
        if not session.get('HistoryArray'):
            session['HistoryArray'] = [{'x': None, 'y': None}]

        # global x, y
        if operation == 'increment':
            session['x'] = session['x'] + 0.1

        session['y'] = math.sin(session['x'])

        if operation == 'increment':
            session['HistoryArray'].append({'x': session['x'], 'y': session['y']})
            return jsonify(x=[session['x']], y=[session['y']])
        else:
            response_object = {'status': 'success'}
            # malist[-10:] last n elements
            # malist[::-1] reversing using list slicing
            session['HistoryArray'] = session['HistoryArray'][-10:]
            response_object['sinus'] = session['HistoryArray'][::-1]
            return jsonify(response_object)

    @app.route("/api/bokehinlinejs", methods=['GET', 'POST'])
    def simple():
        streaming = True

        s1 = AjaxDataSource(data_url="/api/datasinus/increment", polling_interval=1000, mode='append')

        s1.data = dict(x=[], y=[])

        s2 = ColumnDataSource(data=dict(x=[], y=[]))

        s1.selected.js_on_change(
            'indices',
            CustomJS(
                args=dict(s1=s1, s2=s2),
                code="""
            var inds = cb_obj.indices;
            var d1 = s1.data;
            var d2 = s2.data;
            d2['x'] = []
            d2['y'] = []
            for (var i = 0; i < inds.length; i++) {
                d2['x'].push(d1['x'][inds[i]])
                d2['y'].push(d1['y'][inds[i]])
            }
            s2.change.emit();
            
            """,
            ),
        )

        p1 = figure(
            x_range=(0, 10),
            y_range=(-1, 1),
            plot_width=400,
            plot_height=400,
            title="Streaming, take lasso to copy points (refresh after)",
            tools=bokeh_tool_list,
            tooltips=bokeh_tool_tips,
            name="p1",
        )
        p1.line('x', 'y', source=s1, color="blue", selection_color="green")
        p1.circle('x', 'y', size=1, source=s1, color=None, selection_color="red")

        p2 = figure(
            x_range=p1.x_range,
            y_range=(-1, 1),
            plot_width=400,
            plot_height=400,
            tools=bokeh_tool_list,
            title="Watch here catched points",
            tooltips=bokeh_tool_tips,
            name="p2",
        )
        p2.circle('x', 'y', source=s2, alpha=0.6)

        response_object = {}

        # gr=gridplot([p1,p2], ncols=2, plot_width=250, plot_height=250)
        gr = row(p1, p2)
        response_object['gr'] = json_item(gr)
        return jsonify(response_object)

    return app


if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('--PROD', action='store_true')
    parser.add_argument('--DEBUG', action='store_true')
    args = parser.parse_args()

    DEBUG = args.DEBUG
    PROD = args.PROD

    print('DEBUG=', DEBUG)
    print('PROD=', PROD)

    app = create_app(PROD=PROD, DEBUG=DEBUG)

    if not PROD:
        PORT = app.config["PORT_FLASK_DEV"]
    else:
        PORT = app.config["PORT_FLASK_PROD"]

    if DEBUG:
        app.run(host='0.0.0.0', port=PORT, debug=DEBUG)

    else:
        from waitress import serve

        serve(app, host="0.0.0.0", port=PORT)
