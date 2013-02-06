src_dir = src
test_dir = tests
build_dir = build
prefix = .
dist_dir = ${prefix}/download
closure_compiler = ${build_dir}/compiler.jar
node_engine ?= `which node nodejs`
version = $(shell cat version.txt)
date=$(shell git log -1 --pretty=format:%ad)

license = ${src_dir}/license.txt
license_min = ${src_dir}/license_min.txt

src_file = ${src_dir}/core.js\
			${src_dir}/loaders.js

debug_js = ${dist_dir}/matrix.debug.js
out_js = ${dist_dir}/matrix.js
output_js_min = ${dist_dir}/matrix.min.js

src_file_jquery = ${src_dir}/intro.txt\
			${src_dir}/core.js\
			${src_dir}/loaders.js\
			${src_dir}/outro.txt

debug_js_jquery = ${dist_dir}/matrix_with_jquery.debug.js
out_js_jquery = ${dist_dir}/matrix_with_jquery.js
output_js_min_jquery = ${dist_dir}/matrix_with_jquery.min.js


all:
	@@mkdir -p ${dist_dir}
	@@cat ${license} ${src_file} | sed "s/@version/${version}/" | \
						sed "s/@date/${date}/" > ${debug_js} ;
									
	@@cat ${license} ${src_file} | sed "s/@version/${version}/" | \
						sed "s/@date/${date}/" | \
						sed -e '/matrix\.log/d' | \
						sed -e '/\/\/#debug/,/\/\/#end_debug/d' > ${out_js} ;
						
	@@java -jar ${build_dir}/compiler.jar  --js ${out_js}  --js_output_file ${output_js_min}.tmp

	@@cat ${license_min} ${output_js_min}.tmp | \
    	                    sed "s/@version/${version}/" | \
    						sed "s/@date/${date}/" > ${output_js_min}
							
	@@rm -f ${output_js_min}.tmp
	
	@@cat ${license} ${src_file_jquery} | sed "s/@version/${version}/" | \
						sed "s/@date/${date}/" > ${debug_js_jquery} ;
									
	@@cat ${license} ${src_file_jquery} | sed "s/@version/${version}/" | \
						sed "s/@date/${date}/" | \
						sed -e '/matrix\.log/d' | \
						sed -e '/\/\/#debug/,/\/\/#end_debug/d' > ${out_js_jquery} ;
						
	@@java -jar ${build_dir}/compiler.jar  --js ${out_js_jquery}  --js_output_file ${output_js_min_jquery}.tmp

	@@cat ${license_min} ${output_js_min_jquery}.tmp | \
    	                    sed "s/@version/${version}/" | \
    						sed "s/@date/${date}/" > ${output_js_min_jquery}
							
	@@rm -f ${output_js_min_jquery}.tmp
	
	@@${node_engine} build/jslint-check.js	
	
jslint:
	@@${node_engine} build/jslint-check.js


clean:
	@@echo "Removing Distribution directory:" ${dist_dir}
	@@rm -rf ${dist_dir}
