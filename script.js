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

    return fetch("https://api.github.com/users/" + username).then(function (response) {

        if (!response.ok) {

            if (response.status == 404)
                throw Error("User not found.")

            throw Error("Error in getting user info.")
        }

        return response.json()

    }).then(function (body) {
        responseObject.data = body
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
    let location = ["location"];
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


function showMessage(message, className = "errorMessageStyle") {
    let elem = document.getElementById("messageBox")
    elem.innerHTML = message;
    elem.style.display = 'block';
    elem.setAttribute("class", className)
}

function hideMessage() {
    let elem = document.getElementById("messageBox")
    elem.style.display = 'none';
}

function disableForm() {
    document.getElementById("formDimmer").style.display = "flex";
}

function enableForm() {
    document.getElementById("formDimmer").style.display = "none";
}

function submitEventHandler(event) {

    event.preventDefault();

    disableForm();
    let username = document.getElementById("usernameInput").value;

    if (!username && username.trim() == "") {
        showMessage("invalid Username.")
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