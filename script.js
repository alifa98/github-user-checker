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
        responseObject.data = body
        localStorage.setItem(username, JSON.stringify(responseObject)); //saving successful response on local storate
        return responseObject;

    }).catch(function (error) {
        responseObject.success = false;
        responseObject.errorMessage = error.message;
        return responseObject;
    })



}



function showDetail(data) {

    /**
     * getting required info from json.
     */
    let name = data["name"];
    let bio = data["bio"];
    let location = data["location"];
    let blog = data["blog"]
    let avatar = data["avatar_url"]

    /**
     * getting required dom elements from document.
     */
    let imageElem = document.getElementById("avatar");
    let bioElem = document.getElementById("bio");
    let nameElem = document.getElementById("name");
    let blogElem = document.getElementById("blog");
    let locationElem = document.getElementById("location");

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