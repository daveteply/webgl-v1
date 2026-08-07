# WebglV1

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner inside the DevContainer terminal, use:

```bash
npm test
```

To generate code coverage reports:

```bash
ng test --coverage
```

## Running end-to-end (E2E) tests

End-to-end tests simulate real user interactions (canvas pointer dragging, wheel rotation, score updates, and dialog flows) using [Playwright](https://playwright.dev/).

To run E2E tests:

```bash
# 1. Install Playwright browser binaries and system libraries (first time setup in running container):
npx playwright install --with-deps

# 2. Start dev server in container terminal:
npm start

# 3. In a separate terminal window inside DevContainer:
npx playwright test
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
