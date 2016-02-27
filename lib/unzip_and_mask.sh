#!/bin/bash

mkdir Masked

for f in YAPS*; do
	STEM=$(basename "${f}" )
	python masker.py "${f}"
done

rm -rf $(ls -l | grep -v .masked | awk '{print $9}')


