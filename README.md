# README    
These files/dirs related to front-end form:
- index.html
- scripts/
- styles/

The dir `google-app-script` for all back-end App Script handling. The entry point, `index.gs` contains code to handle both:
- customer form submissions (the `submission-*.gs` files), and
- Node script/CLI updates (`update-handler.gs`) [Ignore this file for now]

The dir `node-ein-processing` is related to local processing and updating of customer records, from local `.csv` files (downloaded from GSheet). Only this module queries 3rd party EIN service. [Ignore this dir for now]