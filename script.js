/*
    This is a simple project for Internet Engineering Course - Spring 2021
    Mid-term Exam.


       _ _    __                  _ _
  __ _| (_)  / _| __ _ _ __ __ _ (_|_)
 / _` | | | | |_ / _` | '__/ _` || | |
| (_| | | | |  _| (_| | | | (_| || | |
 \__,_|_|_| |_|  \__,_|_|  \__,_|/ |_|
                               |__/
*/


async function getUserInfo(username) {

    let responseObject = {
        data: {},
        success: true,
        errorMessage: ""
    }

    let localData = JSON.parse(localStorage.getItem(username));

    //if local data exist so return it.
    if (localData) {
        console.log("Load from Local Storage");
        return localData;
    }
    // if data does not exist on local storage this fetch gets it.
    return fetch("https://api.github.com/users/" + username).then(function (response) {

        if (!response.ok) {

            if (response.status == 404)
                throw Error("User not found.")

            if (response.status == 403)
                throw Error("Forbidden (Maybe because of rate limit.)")

            throw Error("Error in getting user info.")
        }

        return response.json()

    }).then(function (body) {

        return getFavoriteLanguage(body["repos_url"]).then(fav_lang => {
            responseObject.data = body
            responseObject.data["favorite_language"] = fav_lang;
            localStorage.setItem(username, JSON.stringify(responseObject)); //saving successful response on local storate
            return responseObject;
        });

    }).catch(function (error) {
        responseObject.success = false;
        responseObject.errorMessage = error.message;
        return responseObject;
    })

}

async function getFavoriteLanguage(repositories_url) {

    return fetch(repositories_url).then(responseHeader => {
        if (!responseHeader.ok)
            throw Error("Not Found!!");
        return responseHeader.json();

    }).then(repos => {

        let numberOfCheckRepository = Math.min(repos.length, 5); // if repos count was less than 5

        repos.sort((a, b) => {
            return new Date(b["pushed_at"]) - new Date(a["pushed_at"]);
        });


        let promises = [];
        repos.slice(0, numberOfCheckRepository).forEach(repo => {
            promises.push(getLanguages(repo["languages_url"]));
        });


        let top_languages = {};
        return Promise.all(promises).then(values => {
            values.forEach(langs => {
                if (langs) {
                    Object.keys(langs).forEach(key => {
                        if (!top_languages[key])
                            top_languages[key] = 0;

                        top_languages[key] += langs[key];
                    });
                }
            });

            //return language which has maximum score.
            return Object.keys(top_languages).reduce((fav, item) => top_languages[item] > top_languages[fav] ? item : fav);
        });

    }).catch(error => {
        return error.message;
    });
}

async function getLanguages(languages_url) {

    return fetch(languages_url).then(headerInfos => {
        if (!headerInfos.ok) {
            throw Error("Error In getting languages");
        }
        return headerInfos.json();
    }).catch(_e => { });

}

function showDetail(data) {

    /**
     * getting required info from json.
     */
    let name = data["name"];
    let bio = data["bio"];
    let location = data["location"];
    let blog = data["blog"];
    let avatar = data["avatar_url"];
    let favLang = data["favorite_language"];

    /**
     * getting required dom elements from document.
     */
    let imageElem = document.getElementById("avatar");
    let bioElem = document.getElementById("bio");
    let nameElem = document.getElementById("name");
    let blogElem = document.getElementById("blog");
    let locationElem = document.getElementById("location");
    let favLangElem = document.getElementById("favoriteLang");

    /**
     * filling elements with data
     */

    imageElem.setAttribute("src", avatar);
    imageElem.setAttribute("title", name + "'s Avatar");
    imageElem.setAttribute("alt", name + "'s Avatar");

    bioElem.innerHTML = bio ? bio.replace("\n", "<br>") : "";

    nameElem.innerHTML = name;

    if (blog) {
        blogElem.setAttribute("href", blog);
        blogElem.setAttribute("title", name + "'s blog address");
        blogElem.innerHTML = blog;
    }

    locationElem.innerHTML = location;

    favLangElem.innerHTML = favLang;

}


function showMessage(message, className = "general-message alert") {

    document.getElementById("messageText").innerHTML = message;

    let boxElement = document.getElementById("messageBox")
    boxElement.setAttribute("class", className);
    boxElement.style.display = "flex";
}

function hideMessage() {
    document.getElementById("messageBox").style.display = "none";
}

function disableForm() {
    document.getElementById("formDimmer").style.display = "flex";
}

function enableForm() {
    document.getElementById("formDimmer").style.display = "none";
}

function submitEventHandler(event) {

    event.preventDefault();

    hideMessage();
    disableForm();
    let username = document.getElementById("usernameInput").value;

    if (!username || username.trim() == "") {
        showMessage("invalid Username.", "general-message warn");
        enableForm();
    } else {

        getUserInfo(username).then(responseObj => {
            if (responseObj.success) {
                showDetail(responseObj.data);
                enableForm();
            } else {
                showMessage(responseObj.errorMessage);
                enableForm();
            }
        });
    }
}

document.getElementById("formSubmitBtn").addEventListener("submit", submitEventHandler);