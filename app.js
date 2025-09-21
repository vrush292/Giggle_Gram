  /** This script handles all the interactive logic for the GiggleGram application.
         /
        // We wrap our entire application in an IIFE (Immediately Invoked Function Expression).
        // This creates a private scope for our variables and functions, preventing them
        // from polluting the global namespace. It's a common pattern for writing modular JavaScript.*/
        const GiggleGramApp = (() => {

            // --- API Configuration ---
            // Storing API URLs and keys in a dedicated object makes the code cleaner and easier to manage.
            // If an API endpoint changes, you only have to update it in one place.
            const API_CONFIG = {
                joke: {
                    url: 'https://official-joke-api.appspot.com/random_joke'
                },
                quote: {
                       url: 'https://api.api-ninjas.com/v1/quotes',
                    // IMPORTANT: Replace "YOUR_API_KEY" with your actual key from api-ninjas.com
                    // Never expose your API key directly in client-side code in a real public application.
                    // For learning purposes, this is okay. In production, this should be handled by a backend server.
                    key: '31QJlR8WDfEauP3gVEZyLY4qYuFalrvf2BHDurq8'
                }
            };

            // --- DOM Element Cache ---
            // We get references to all the HTML elements we need to interact with just once and store them here.
            // This is more efficient than repeatedly searching the DOM for the same element.
            const DOM = {
                homeScreen: document.getElementById('homeScreen'),
                jokeScreen: document.getElementById('jokeScreen'),
                quoteScreen: document.getElementById('quoteScreen'),
                getJokeButton: document.getElementById('getJokeButton'),
                getQuoteButton: document.getElementById('getQuoteButton'),
                jokeTextContainer: document.getElementById('jokeTextContainer'),
                anotherJokeButton: document.getElementById('anotherJokeButton'),
                funnyButton: document.getElementById('funnyButton'),
                quoteTextContainer: document.getElementById('quoteTextContainer'),
                anotherQuoteButton: document.getElementById('anotherQuoteButton'),
                goBackButtons: document.querySelectorAll('.back-button')
            };

            // --- Core Functions ---

            /**
             * Manages screen visibility. It hides all screens and then shows only the one specified.
             * @param {HTMLElement} screenToShow - The screen element to make visible.
             */
            const displayScreen = (screenToShow) => {
                // We put all screens in an array to easily loop over them.
                [DOM.homeScreen, DOM.jokeScreen, DOM.quoteScreen].forEach(screen => {
                    // The 'hidden' class (from Tailwind CSS) is added or removed based on the condition.
                    // screen.classList.toggle is a concise way to do this.
                    screen.classList.toggle('hidden', screen !== screenToShow);
                });
            };

            /**
             * Fetches a random joke from the API and displays it.
             * This is an "async" function, which allows us to use the "await" keyword
             * to handle asynchronous operations like API calls more cleanly.
             */
            const showNewJoke = async () => {
                // Provide immediate feedback to the user that something is happening.
                DOM.jokeTextContainer.innerHTML = '<p class="opacity-70">Getting a new giggle...</p>';
                
                // The "try...catch" block is for error handling. If anything goes wrong inside "try",
                // the code inside "catch" will be executed.
                try {
                    // "fetch()" starts the process of fetching a resource from the network.
                    // It's a modern replacement for XMLHttpRequest. It returns a Promise.
                    // "await" pauses the function execution until the Promise is resolved (i.e., the API responds).
                    const response = await fetch(API_CONFIG.joke.url);

                    // Check if the response was successful (HTTP status code in the range 200-299).
                    // If not, we throw an error to be caught by the "catch" block.
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    
                    // The response from fetch is not the actual data. We need to parse the response body.
                    // ".json()" is a method that reads the response stream and parses it as JSON.
                    // This also returns a Promise, so we "await" it.
                    const jokeData = await response.json();
                    
                    // Now that we have the data, we update the HTML to display the joke.
                    DOM.jokeTextContainer.innerHTML = `
                        <p class="font-semibold">${jokeData.setup}</p>
                        <p class="mt-2">${jokeData.punchline}</p>
                    `;
                } catch (error) {
                    // If any error occurred in the "try" block, it will be caught here.
                    console.error("Failed to fetch joke:", error);
                    DOM.jokeTextContainer.textContent = "Oops! Couldn't fetch a joke. Please try again.";
                }
            };

            /**
             * Fetches a random quote from the API using an API key and displays it.
             */
            const showNewQuote = async () => {
                DOM.quoteTextContainer.innerHTML = '<p class="opacity-70">Fetching some wisdom...</p>';
                
                 // Check if the user has replaced the placeholder API key.
                if (API_CONFIG.quote.key === 'YOUR_API_KEY' || API_CONFIG.quote.key === '') {
                    DOM.quoteTextContainer.innerHTML = `
                        <p class="text-red-300 font-semibold">Please add your API key in the script!</p>
                        <p class="text-sm mt-2">You can get a free one from api-ninjas.com</p>
                    `;
                    return; // Stop the function if no key is provided.
                }

                try {
                    // This API call is slightly different because it requires an API key.
                    // We pass a second argument to fetch(): an options object.
                    // Here, we specify the 'headers' property to include our API key.
                    // APIs use headers to get metadata about the request, like authentication tokens.
                    const response = await fetch(API_CONFIG.quote.url, {
                        headers: {
                            'X-Api-Key': API_CONFIG.quote.key
                        }
                    });

                    // Handle potential errors, including a specific check for a bad API key.
                    if (!response.ok) {
                         if (response.status === 401 || response.status === 403) {
                             throw new Error('Authentication failed. Is your API key correct?');
                        }
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const quoteDataArray = await response.json();
                    // This specific API returns an array with one object, so we access the first element.
                    const quoteData = quoteDataArray[0];

                    DOM.quoteTextContainer.innerHTML = `
                        <p>"${quoteData.quote}"</p>
                        <em class="block text-right w-full mt-2 opacity-80">- ${quoteData.author}</em>
                    `;
                } catch (error) {
                    // Display specific error messages to the user.
                    console.error("Failed to fetch quote:", error);
                    DOM.quoteTextContainer.textContent = `Oops! ${error.message}`;
                }
            };

            /**
             * Handles the visual feedback for the "Funny!" button.
             */
            const handleFunnyButtonClick = () => {
                const originalText = DOM.funnyButton.textContent;
                DOM.funnyButton.textContent = 'Haha! 😂';
                DOM.funnyButton.classList.add('cursor-not-allowed', 'opacity-50');
                // setTimeout is used to revert the button text back to its original state after 1.5 seconds.
                setTimeout(() => {
                    DOM.funnyButton.textContent = originalText;
                    DOM.funnyButton.classList.remove('cursor-not-allowed', 'opacity-50');
                }, 1500);
            };

            /**
             * Binds all the necessary event listeners for the application.
             * This function centralizes all our event handling setup.
             */
            const bindEventListeners = () => {
                DOM.getJokeButton.addEventListener('click', () => {
                    showNewJoke();
                    displayScreen(DOM.jokeScreen);
                });

                DOM.getQuoteButton.addEventListener('click', () => {
                    showNewQuote();
                    displayScreen(DOM.quoteScreen);
                });

                DOM.goBackButtons.forEach(button => {
                    button.addEventListener('click', () => displayScreen(DOM.homeScreen));
                });

                DOM.anotherJokeButton.addEventListener('click', showNewJoke);
                DOM.anotherQuoteButton.addEventListener('click', showNewQuote);
                DOM.funnyButton.addEventListener('click', handleFunnyButtonClick);
            };

            /**
             * Initializes the application. This is the starting point.
             */
            const init = () => {
                bindEventListeners();
            };

            // This is the public interface of our module. We only expose the 'init' function.
            return {
                init: init
            };

        })();

        // --- App Initialization ---
        // We wait for the browser to finish loading the HTML before we run our script.
        // 'DOMContentLoaded' is the event that fires when the initial HTML document has been
        // completely loaded and parsed, without waiting for stylesheets, images, etc.
        document.addEventListener('DOMContentLoaded', GiggleGramApp.init);