echo "Attempting to run initialization script "

sleep 10 # sleeping for 10 secs to give Canton time to start

daml script --dar .daml/dist/prediction-0.0.1.dar --script-name Main:example --ledger-host localhost --ledger-port 5011

echo "Done"
