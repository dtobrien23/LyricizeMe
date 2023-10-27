# Storing each unique artist name in a list to be used for autosuggest
import csv
import json

csv_file_path = 'Datasets/artists_and_ids_after_processing.csv' 
unique_values = set()

column_index = 0 

unique_values_list = []

with open(csv_file_path, 'r', newline='') as csvfile:
    csvreader = csv.reader(csvfile)
    for row in csvreader:
        if len(row) > column_index:
            value = row[column_index]
            if value not in unique_values_list:
                unique_values_list.append(value)

json_string = json.dumps(unique_values_list)

with open('unique_artists.json', 'w') as json_file:
                json.dump(unique_values_list, json_file, indent=4)


