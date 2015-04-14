build:
	npm install uglify-js -g
	cd src && npm install jquery && npm install underscore && browserify SnippetMain.js -o codatlas_raw.js && uglifyjs codatlas_raw.js --compress > codatlas.js

gen:build
	mkdir dist
	rm src/codatlas_raw.js
	mv src/codatlas.js dist
	cp src/codatlas.css dist

clean:
	rm -rf dist
