#!/usr/bin/env python

import argparse
import sys

def get_record_type(record):
    return record[9:12]

def show_record_types_in_file(inputFile):
    recordTypes = set()

    for line in inputFile:
        recordTypes.add(get_record_type(line))

    print "Records in ", inputFile.name
    print sorted(recordTypes)
    print
    return

def sanitize_071_record(record):
    start = record[:74]
    return start + ('*' * (len(record) - len(start)))

def sanitize_emf(inputFile):
    KNOWN_RECORDS = {'010', '070', '071', '072', '080', '300', '301', '500', '501', '503', '910', '970', '980'}

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('fileNames', nargs='+', help='Vantiv eMAF (EMF) file(s) to process.')
    parser.add_argument('-r', '--record-types-only', action='store_true', 
        help='Only lists records contained in Vantiv eMAF (EMF) file. Does not sanitize files.')

    args = parser.parse_args()

    for fileName in args.fileNames:
        with open(fileName, 'r') as inputFile:
            show_record_types_in_file(inputFile)
