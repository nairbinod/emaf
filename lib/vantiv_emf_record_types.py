#!/usr/bin/env python

import argparse
import os
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

def mask_071_record(record):
    start = record[:73]
    return start + ('X' * (len(record) - len(start))) + '\n'

def mask_072_record(record):
    return record[:15] + ('X' * 26) + record[41:]

def mask_300_record(record):
    return record[:56] + ('X' * 6) + record[62:] #Currently only shows last 3 for Amex.

def mask_501_record(record):
    start = record[:15]
    return start + ('X' * (len(record) - len(start))) + '\n'

def mask_emf(inputFile):
    KNOWN_RECORDS = {'010', '070', '071', '072', '080', '300', '301', '500', '501', '503', '910', '970', '980'}
    NEEDS_MASKING = {'071': mask_071_record, '072': mask_072_record, '300': mask_300_record, '501': mask_501_record}

    splitFileName = os.path.splitext(inputFile.name)
    outputFileName = splitFileName[0] + '.masked' + splitFileName[1]

    with open(outputFileName, 'w') as outputFile:
        for line in inputFile:
            recordType = get_record_type(line)
            if recordType in KNOWN_RECORDS:
                maskedLine = line
                if recordType in NEEDS_MASKING:
                    maskedLine = NEEDS_MASKING[recordType](line)
                outputFile.write(maskedLine)
            else:
                print "Unknown record type ", recordType


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('fileNames', nargs='+', help='Vantiv eMAF (EMF) file(s) to process.')
    parser.add_argument('-r', '--record-types-only', action='store_true', 
        help='Only lists records contained in Vantiv eMAF (EMF) file. Does not mask files.')

    args = parser.parse_args()

    for fileName in args.fileNames:
        with open(fileName, 'r') as inputFile:
            if args.record_types_only:
                show_record_types_in_file(inputFile)
            else:
                mask_emf(inputFile)

