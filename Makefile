src_dir = src
test_dir = tests
build_dir = build
prefix = .
dist_dir = ${prefix}/dist
closure_compiler = ${build_dir}/compiler.jar
node_output = ${dist_dir}/matrix.min.js
closure_output = ${dist_dir}/jquery.matrix.min.closure.js
node_engine ?= `which node nodejs`
version = $(shell cat version.txt)
date=$(shell git log -1 --pretty=format:%ad)

src_file = ${src_dir}/head.txt\
			${src_dir}/matrix.core.js\
			${src_dir}/matrix.module.js\
			${src_dir}/matrix.js.js\
			${src_dir}/matrix.css.js


out_js = ${dist_dir}/matrix.js
debug_js = ${dist_dir}/matrix.debug.js


#cat jquery.matrix.js matrix.js.js matrix.css.js > all.js

all:
	@@mkdir -p ${dist_dir}
	@@cat ${src_file} | sed "s/@version/${version}/" | \
						sed "s/@date/${date}/" > ${debug_js} ;
						
	@@cat ${debug_js} ${src_dir}/tail.txt |	sed -e '/matrix\.log/d' | \
						sed -e '/\/\/#debug/,/\/\/#end_debug/d' > ${out_js};

	@@${node_engine} ${build_dir}/uglify.js --unsafe ${out_js} > ${node_output}.tmp
	@@${node_engine} ${build_dir}/post-compile.js ${node_output}.tmp > ${node_output}
	@@rm -f ${node_output}.tmp
	
	@@${node_engine} build/jslint-check.js	
	
jslint:
	@@${node_engine} build/jslint-check.js



node:
	@@mkdir -p ${dist_dir}
	@@${node_engine} ${build_dir}/uglify.js --unsafe ${out_js} > ${node_output}.tmp
	@@${node_engine} ${build_dir}/post-compile.js ${node_output}.tmp > ${node_output}
	@@rm -f ${node_output}.tmp	


clean:
	@@echo "Removing Distribution directory:" ${dist_dir}
	@@rm -rf ${dist_dir}
