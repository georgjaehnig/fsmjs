rm *.dot *.png
npm test
for file in *.dot 
do
	echo "dot -Tpng $file > $file.png"
done
open *.png
