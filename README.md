## Overview

This repo holds source code for King Edward VII's Website. Project is built on top of https://nextjs.org and Chakra-UI to allow easy contributions be it to code or other areas of the website.

## Getting Started

* Install latest (LTS) version of NodeJS
* Verify your installation by running node -v; npm -v command in your terminal / command line, you should see 2 version outputs
* Install project dependencies by running npm i from project root
* Run npm run dev and start building awesome things!

## Commands
    npm run clean - Cleans build artifacts
    npm run dev - Starts project locally (localhost:3000) and recompiles on source code changes
    npm run build - Builds static assets into out folder
    npm run start - Serves static assets from out folder
    npm run prettier - Prettify code
    npm run code - Checks code for correct formating
    npm run test - Tests the code using Jest

## Project Structure

* \_tests\_ - Test cases
* public - Public / static assets for images etc...
* src/components - Basic & reusable components like cards, text, icon etc...
* src/pages - Individual website pages. \_app is a special file for editing global settings
* src/layout - Main layout of the page, with sidebar and drawers
* src/constants - Any constants that are not stored in the database
* src/helper - Helper functions such as calls to database, prettify strings etc.
* src/styles - Certain styling files such as the one used for calendars
* src/types - TypeScript definitions

## Tech Stack

* NextJS - React Framework for Production
* Chakra-UI - Component library
* Prisma - ORM to define data models and their relations
* PlanetScale - MySQL-compatible serverless database platform

## Libraries
Further add ons as necessary

**Necessary**
* Babel - Javascript calendar, used in FullCalendar
* Next-Auth - Authentication library
* Prisma - ORM library for database
* Formidable - Library to parse form uploads with files 
* Next-Transpile - Transpile modules from node_modules using the Next.js Babel configuration
* Nodemailer - Library to send out emails
* React - Frontend necessity
* Safe-JSON-Stringify - Prevent from throwing errors on getters
* Moment and Moment-Timezone - Timezone and Date manipulation library

**Styling**
* Chakra-UI - Component Library 
* Emotion - Styling
* Framer-Motion - Animation
* React-Chakra-Pagination - Easy way for paginate lists using Chakra UI, using lists components and hooks
* React-Icons - Library for Icons

**Component**
* FullCalendar - Calendar with list view
* Google-Map-React - Map view
* Node-Telegram-API - Library for Telegram bots
* React-Calendar - Small calendar with datepicker
* React-Table - Table

**Utilities**
* ESlint - Code formatter and checker
* Sharp - High-performance image processing
* SWR - React-Hooks library for data fetching
* Jest - Testing library
* Husky - Pre-commit commands
* @testing-library - Testing library for React components
## Contributing

* Fork this repository to your own profile
* Work on any changes you'd like to make
* When ready, submit a PR to main branch of this repository
* If all automated checks pass, community will review your PR and either approve it or ask for changes
