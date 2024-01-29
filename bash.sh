curl https://mc.adobe.io/sitesinternal/target/audiences \
   -H "Accept: application/vnd.adobe.target.v3+json" \
   -H "X-Api-Key: {}" \
   -H "Authorization: Bearer {}" | jq

curl https://mc.adobe.io/sitesinternal/target/audiences/2048630 \
   -H "Accept: application/vnd.adobe.target.v3+json" \
   -H "X-Api-Key: {}" \
   -H "Authorization: Bearer {}" | jq
