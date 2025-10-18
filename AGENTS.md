# Lookup

Lookup is an eductional app that teaches a LUT actually by inspecting the entire flow of lookup's LUT engine workflow

## Tech Stack

- Tanstack Start: Fullstack Framework
- Tanstack Query: Server State Management
- Vitest: testing framework

## Naming Conventions

- Folder and file name should be `kebab-cased`

## Code Organization

- All source code is inside `/src` directory
- Inside `/src` directory, we have the following directories
- `/components` - component library
- `/modules` - should contain all the react-query queries and mutations
- `/features` - should contain all the features

Note: Feature are stand alone mini apps. Each fatures should be stand alone. Each feature is a react component

## Feature development workflow

- All the feature requests are be defined in `./agents/feature-requests`
- Each feature request should contain:
  - Date
  - Title
  - What
  - User Stories: this is one of your core responsibilites. Once you have finished each stories should should put x inside the empty brackets - this tells me that you have actually implemented what i have asked you to implement

## Testing Instructions

- When writing a code [when implementing a new feature], always write tests for pure functions. Lets start with **unit tests** only, testing any utility.. As our application grows we will add other form of tests

## UI Quality Control

- UI Should be polished and look realllly nice like Apple. Keep mindful of animation, spacing color selection [have a good taste]
- Keep the app minimal as possible when building features etc
- Keep the code clean and try to reuse as much as possible
