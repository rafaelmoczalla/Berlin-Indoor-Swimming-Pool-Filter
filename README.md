# Berlin-Indoor-Swimming-Pool-Filter
## Local Development
The `App.tsx` file is the main file of the app where the magic happens.

You can run the app locally in your web browser.
```bash
yarn web
```

When you make any changes to the `App.tsx` the changes are applied immediately and you see them in the web broswer without rebuilding.

## Heroku Stuff
### Setup
This project uses the node.js and static buildpacks from Heroku.
```bash
heroku buildpacks:set heroku/nodejs --app=berlin-indoor-swimming-filter
heroku buildpacks:add heroku-community/static --app=berlin-indoor-swimming-filter
```

### Show Logs
The option `--tail` sends continuous logging to the terminal. For one shot logs remove this option.
```bash
heroku logs --tail --app=berlin-indoor-swimming-backend
```

### Restart
After a new version of the server was deployed to github you need to restart the app.
```bash
heroku restart --app=berlin-indoor-swimming-filter
```