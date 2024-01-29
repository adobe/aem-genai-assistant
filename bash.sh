curl https://mc.adobe.io/sitesinternal/target/audiences \
   -H "Accept: application/vnd.adobe.target.v3+json" \
   -H "X-Api-Key: 5090f9f1be114511944e36b6e640170c" \
   -H "Authorization: Bearer {}" | jq

curl https://mc.adobe.io/sitesinternal/target/audiences/2048630 \
   -H "Accept: application/vnd.adobe.target.v3+json" \
   -H "X-Api-Key: 5090f9f1be114511944e36b6e640170c" \
   -H "Authorization: Bearer {}" | jq
