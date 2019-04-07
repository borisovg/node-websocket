all: test

LCOV = coverage/coverage.lcov

## clean:  delete NPM packages and generated files
.PHONY: clean
clean:
	rm -rf \
		 $(wildcard .nyc_*) \
		coverage \
		node_modules \
		npm-debug.log

## test:   run the tests (default target)
.PHONY: test
test: node_modules
	./node_modules/.bin/nyc \
		--all \
		--cache-dir=./.nyc_cache \
		--cwd ../ \
		--exclude tests/** \
		--report-dir=./tests/coverage \
		--reporter=none \
		--temp-dir=./tests/.nyc_output \
		node_modules/.bin/_mocha -b spec/*
	./node_modules/.bin/nyc report \
		--reporter=html \
		--reporter=text

.PHONY: help
help:
	@sed -n 's/^##//p' Makefile

node_modules: package.json
	npm update || (rm -rf node_modules; exit 1)
	touch node_modules