#!/bin/bash

# Database credentials
db_name="yapstonedm"

# Other options
backup_path="/Users/jskilbeck/Code/Node/emaf/db_backup"
date=$(date +"%d-%b-%Y")
sql_file=$db_name
gnu_file=$sql_file.gz
username="skilbjo"
server="finance"
server_path="/home/skilbjo/code/sql/emaf/"

# Create backup
pg_dump -c -U $username $db_name > $backup_path/$db_name-$date.sql

# GNU Zip Global
cp $backup_path/$db_name-$date.sql $backup_path/$sql_file
gzip -c $backup_path/$sql_file > $backup_path/$gnu_file

# SSH transfer
cat $backup_path/$gnu_file | ssh $username@$server "cat > $server_path/$gnu_file"

# GNU unZip
ssh $username@$server "gzip -df $server_path/$gnu_file"

# psql load
ssh $username@$server "psql -U $username $db_name < $server_path/$sql_file"


