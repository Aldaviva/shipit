NODE := node
NPM := npm
LESSC := node_modules/less/bin/lessc
JSL := jsl

all: lint css

css:
	@$(LESSC) ui/styles/all.less ui/styles/all.css

.PHONY: lint
lint:
	@$(JSL) --conf=tools/jsl.conf --nofilelisting --nologo --nosummary *.js lib/*.js ui/scripts/*.js

run: all
	@$(NODE) .

deps:
	@$(NPM) install