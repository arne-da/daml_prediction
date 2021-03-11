
// start all local instances defined in the configuration file
nodes.local start

participant1.domains.connect_local(mydomain)

// upload DAR 
participants.all.dars.upload(".daml/dist/prediction-0.0.1.dar")