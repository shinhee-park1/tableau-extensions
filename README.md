# Tableau Extensions API
[![Tableau Supported](https://img.shields.io/badge/Support%20Level-Tableau%20Supported-53bd92.svg)](https://www.tableau.com/support-levels-it-and-developer-tools)

## Setup and Running Samples

### Prerequisites
* You must have Node.js and npm installed. You can get these from [https://nodejs.org](https://nodejs.org).

### Install Extensions API SDK Components and Start Server

1. Open a command prompt window to the location where you cloned this repo.

2. Install the Extensions API SDK components.

    **npm install**

3. Build the TypeScript samples and install the Extensions API types library.

   **npm run build**

4. Start the local Dashboard Extension server.

   **npm start**

5. Launch Tableau and try the sample extensions in a dashboard. The samples are located in the `Samples` folder.

 >**Note** The local web server you start just serves to host the extension samples and extensions used in the tutorial, which have URLs similar to the following: `http://localhost:8765/Samples/DataSources/datasources.html` or `http://localhost:8765/Samples-Typescript/DataSources/datasources.html`