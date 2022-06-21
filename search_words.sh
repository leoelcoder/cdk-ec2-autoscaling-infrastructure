#!/bin/bash
if [ ! $@ ]; then
    echo 'No arguments are given.';
    exit;
fi

if [[ ! -f "$1" ]]; then
   echo "file not exists"
   exit;
fi

FILEPATH=$1;
RESULTS_FILE=./search_results.txt
shift;

if [ ! $@ ]; then
    echo 'No words to search given.';
    exit;
fi

echo "" > $RESULTS_FILE

for KEY_WORD in "$@"
do
 COUNT=$(grep -o -i $KEY_WORD $FILEPATH | wc -l)
 echo $KEY_WORD
 echo $COUNT
 echo "$KEY_WORD - $COUNT \n" >> ./search_results.txt
done