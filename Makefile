build:	
	cd src && npm install jquery && npm install underscore && browserify SnippetMain.js -o codatlas.js

gen:build
	mkdir dist
	mv src/codatlas.js dist
	cp src/codatlas.css dist

clean:
	rm -rf dist
