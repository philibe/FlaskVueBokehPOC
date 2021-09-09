# server
## Flask

### Project setup
Install Flask but also nodejs in conda environment
```
conda env create --file server/environment.yml
```
### Before run
```
conda activate flask_vue_bokeh
```

### Run developpement environment
```
python server/app.py [--DEBUG]
```

### Run production environment
```
python server/app.py [--DEBUG] --PROD
```

### Format python files
```
black .
```


# frontend
## VueJs 3

### Before yarn
```
conda activate flask_vue_bokeh
```

### Project setup
```
yarn  --cwd frontend/ install
```

### Compiles and hot-reloads for development
```
yarn  --cwd frontend/ run serve
```

### Compiles and minifies for production
```
yarn  --cwd frontend/ run build
```

### Lints and fixes files
```
yarn  --cwd frontend/ run lint
```

