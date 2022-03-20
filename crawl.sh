

# Map indoor swimming pool index to name
indexes="1 2 7 9 11 15 17 18 19 21 24 26 27 28 29 30 31 34 38 42 43 45 46 47 48 49 51 52 54 60 61 62 64 68 70 71 74 76 79 81"

echo "Map previous indexes to indoor pool names"
echo "const pools = new Map<string, string>([";
for index in $indexes; do
  result=$(curl -L -s https://pretix.eu/Baeder/$index | awk "/content-header/{getline; print}");
  result=$(echo "$result" | xargs );
  echo "  [ '$index', '$result' ],";
done
echo "]);"

exit

# Get all existing indoor swimming pool websites
echo "Get all working indexes";
printf "[ ";
for i in $(seq 0 100); do
  if ! curl -L -s https://pretix.eu/Baeder/$i | grep -q "Not found\|Keine Berechtigung";
  then
    printf "$i, ";
  fi;
done
printf " ]";