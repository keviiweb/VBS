## Overview

This repo holds sourcecode for King Edward VII's Venue Booking System and CCA Attendance tracking. Project is built on top of https://nextjs.org and Chakra-UI to allow easy contributions be it to code or other areas of the website.

## Getting Started

Install latest (LTS) version of NodeJS
Verify your installation by running node -v; npm -v command in your terminal / command line, you should see 2 version outputs
Install project dependencies by running npm i from project root
Run npm run dev and start building awesome things!

## Commands

npm run clean - Cleans build artifacts
npm run dev - Starts project locally (localhost:3000) and recompiles on source code changes
npm run build - Builds static assets into out folder
npm run start - Serves static assets from out folder
npm run prettier - Checks code for correct formating

## Project Structure

public - Public / static assets for images etc...
src/components - Basic & reusable components like cards, text, icon etc...
src/pages - Individual website pages. \_app is a special file for editing global settings
src/layout - Main layout of the page, with sidebar and drawers
src/constants - Any constants that are not stored in the database

## Tech Stack

NextJS - React Framework for Production
Chakra-UI - Component library
Prisma - ORM to define data models and their relations
PlanetScale - MySQL-compatible serverless database platform

## Contributing

Fork this repository to your own profile
Work on any changes you'd like to make
When ready, submit a PR to main branch of this repository
If all automated checks pass, community will review your PR and either approve it or ask for changes
