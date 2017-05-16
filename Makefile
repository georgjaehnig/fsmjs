t:
	npm test
	for file in *.dot ; do \
		dot -Tpng $$file > $$file.png ; \
	done
	open *.png

c:
	rm *.dot *.png

