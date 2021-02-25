"use strict";

window.addEventListener("DOMContentLoaded", init);

const allStudents = [];

const Student = {
    fullName: "-unknown-",
    firstName: "-unknown-",
    middleName: "-unknown-",
    nickName: undefined,
    lastName: "-unknown-",
    gender: undefined,
    house: undefined,
    image: undefined,
    prefect: false,
    squad: false,
    expelled: false,
};

const templates = {
    student: document.querySelector(".t-student").content,
    modal: document.querySelector(".t-modal").content,
};

const settings = {
    sortBy: "name",
    sortDir: "asc",
    filterBy: "all",
};

let unfilteredStudents;

function init() {
    console.log("init");

    loadJSON();

    initButtons();
}

function loadJSON() {
    console.log("loadJSON");

    fetch("https://petlatkea.dk/2021/hogwarts/students.json")
        .then((response) => response.json())
        .then((jsonData) => {
            unfilteredStudents = jsonData;
            console.log("unfilteredStudents", unfilteredStudents);

            prepareObjects(jsonData);
        });
}

// TODO: Clean up
function prepareObjects(jsonData) {
    console.log("prepareObjects");
    console.log(jsonData);

    jsonData.forEach((jsonObject) => {
        const student = Object.create(Student);

        const fullName = jsonObject.fullname.toLowerCase().trim();
        const firstSpaceInFullName = fullName.indexOf(" ");
        const lastSpaceInFullName = fullName.lastIndexOf(" ");
        const checkForHyphen = fullName.indexOf("-");

        let firstName;
        let firstNameFirstLetter;
        // Firstname
        if (firstSpaceInFullName === -1) {
            firstNameFirstLetter = fullName[0].toUpperCase();
            const firstNameAfterFirstLetter = fullName.substring(1);
            firstName = firstNameFirstLetter + firstNameAfterFirstLetter;
            student.firstName = firstNameFirstLetter + firstNameAfterFirstLetter;
        } else {
            const findFirstName = fullName.substring(0, firstSpaceInFullName);
            firstNameFirstLetter = findFirstName[0].toUpperCase();
            const firstNameAfterFirstLetter = findFirstName.substring(1);
            firstName = firstNameFirstLetter + firstNameAfterFirstLetter;
            student.firstName = firstNameFirstLetter + firstNameAfterFirstLetter;
        }

        let middlePartOfName = fullName.substring(firstSpaceInFullName, lastSpaceInFullName).trim();
        // Middlename or nickname exists
        if (middlePartOfName) {
            // If nickname
            if (middlePartOfName.startsWith('"')) {
                middlePartOfName = middlePartOfName.replaceAll('"', "");

                const middlePartOfNameFirstLetter = middlePartOfName[0].toUpperCase();
                const middlePartOfNameAfterFirstLetter = middlePartOfName.substring(1);
                student.nickName = middlePartOfNameFirstLetter + middlePartOfNameAfterFirstLetter;
                student.middleName = null;

                // Else middlename
            } else {
                const middlePartOfNameFirstLetter = middlePartOfName[0].toUpperCase();
                const middlePartOfNameAfterFirstLetter = middlePartOfName.substring(1);
                student.middleName = middlePartOfNameFirstLetter + middlePartOfNameAfterFirstLetter;
                student.nickName = null;
            }
        } else {
            student.middleName = null;
            student.nickName = null;
        }

        // Lastname
        const lastName = fullName.substring(lastSpaceInFullName).trim();
        let hasLastNameHyphen;
        let afterHyphenUppercase;

        if (firstName.toLowerCase() !== lastName.toLowerCase()) {
            console.log(lastName);
            hasLastNameHyphen = lastName.indexOf("-");
            // If no hyphen
            if (hasLastNameHyphen === -1) {
                const lastNameFirstLetter = lastName[0].toUpperCase();
                const lastNameAfterFirstLetter = lastName.substring(1);
                student.lastName = lastNameFirstLetter + lastNameAfterFirstLetter;
                // Else has hyphen
            } else {
                const lastNameFirstLetter = lastName[0].toUpperCase();
                const beforeHyphenUppercase = lastName.substring(1, hasLastNameHyphen + 1);
                console.log("beforeHyphen", beforeHyphenUppercase);
                const hyphenUppercase = lastName[hasLastNameHyphen + 1].toUpperCase();
                console.log("hyphenUppercase", hyphenUppercase);
                afterHyphenUppercase = lastName.substring(hasLastNameHyphen + 2);
                console.log("afterHyphenUppercase", afterHyphenUppercase);

                student.lastName = lastNameFirstLetter + beforeHyphenUppercase + hyphenUppercase + afterHyphenUppercase;
            }
        } else {
        }

        // House
        const house = jsonObject.house.toLowerCase().trim();
        const houseFirstLetterUppercase = house[0].toUpperCase();
        const houseAfterFirstLetter = house.substring(1);
        student.house = `${houseFirstLetterUppercase}${houseAfterFirstLetter}`;

        // Gender
        const gender = jsonObject.gender.toLowerCase();
        const genderFirstLetter = gender[0].toUpperCase();
        const genderAfterFirstLetter = gender.substring(1);
        student.gender = genderFirstLetter + genderAfterFirstLetter;

        console.log(student.lastName);

        // Image
        let multipleWithTheSameLastName = 0;
        unfilteredStudents.forEach((unfilteredStudent) => {
            const lastSpace = unfilteredStudent.fullname.lastIndexOf(" ");
            const lastName = unfilteredStudent.fullname
                .substring(lastSpace + 1)
                .trim()
                .toLowerCase();

            if (lastName === student.lastName.toLowerCase()) {
                multipleWithTheSameLastName++;
            }
        });
        // If no lastname
        if (firstName.toLowerCase() === lastName.toLowerCase()) {
            student.image = `img/no-profile-image.png`;
            // Else if lastname with hyphen
        } else if (hasLastNameHyphen !== -1) {
            student.image = `img/${lastName.substring(hasLastNameHyphen + 1)}_${firstNameFirstLetter.toLowerCase()}.png`;
            // Else normal way
        } else if (multipleWithTheSameLastName >= 2) {
            console.log("lol");
            console.log("firstName", firstName);
            student.image = `img/${lastName}_${firstName.toLowerCase()}.png`;
        } else {
            student.image = `img/${lastName}_${firstNameFirstLetter.toLowerCase()}.png`;
        }
        // Add student to allStudent list
        allStudents.push(student);
    });

    console.table(allStudents);

    buildList();
}

function buildList() {
    // Filter the list
    const filteredList = filterList(allStudents);

    // TODO: Take the filtered list and sort it
    // const sortedList = sortList(currentList);

    // Display the list
    displayList(sortedList);
}

function displayList() {
    console.log("displayListOfStudents");

    // Reset list
    document.querySelector(".js-student-list").innerHTML = "";

    // Loop through every student and display them on the screen
    allStudents.forEach(displayStudent);
}

function displayStudent() {
    console.log("displayStudent");

    const templateClone = templates.student.cloneNode(true);

    // Profile image
    templateClone.querySelector(".c-student__profile-image").src = student.image;
    // First name
    templateClone.querySelector(".c-student__first-name-cell").textContent = student.firstName;
    // Last name
    templateClone.querySelector(".c-student__last-name-cell").textContent = student.lastName;
    // House image
    templateClone.querySelector(".c-student__house-image").src = `img/shield-${student.house.toLowerCase()}.png`;

    // Prefect
    templateClone.querySelector(".c-student__prefect-image").src = "img/shield-prefect.png";
    // If student is prefect
    if (student.prefect) {
        templateClone.querySelector(".c-student__prefect-image").classList.remove("u-image-greyscale");
    }

    // Squad
    templateClone.querySelector(".c-student__squad-image").src = "img/squad-medal.png";
    // If student is a part of the squad
    if (student.squad) {
        templateClone.querySelector(".c-student__squad-image").classList.remove("u-image-greyscale");
    }

    // Show popup if click on student
    templateClone.querySelector(".c-student").addEventListener("click", clickStudent);

    function clickStudent() {
        console.log(student);

        // Inserts student data into the popup
        prepareStudentPopup();
        // Shows the popup with the inserted data of the student
        showStudentPopup();
    }

    function prepareStudentPopup() {
        const studentPopup = document.querySelector(".js-student-popup");

        // Image
        studentPopup.querySelector("[data-field=profile-image]").src = student.image;

        // Name
        studentPopup.querySelector("[data-field=name]").textContent = `${student.firstName} ${student.middleName} ${student.nickName} ${student.lastName}`;

        // Gender
        studentPopup.querySelector("[data-field=gender]").textContent = student.gender;

        // House
        studentPopup.querySelector("[data-field=house]").src = `img/shield-${student.house.toLowerCase()}.png`;

        // TODO: Add blood status
        studentPopup.querySelector("[data-field=blood-status]").textContent = "Not sure yet";

        // TODO: Prefetch status
        if (student.prefect) {
            studentPopup.querySelector("[data-field=prefect]").classList.add("is-active");
        }
        studentPopup.querySelector("[data-field=prefect]").src = "img/shield-prefect.png";

        // TODO: Squad status
        if (student.squad) {
            studentPopup.querySelector("[data-field=squad]").classList.add("is-active");
        }
        studentPopup.querySelector("[data-field=squad]").src = "img/squad-medal.png";

        // TODO Expelled status
        studentPopup.querySelector("[data-field=expelled]").textContent = student.expelled;
    }

    function closeStudentPopup() {
        document.querySelector(".js-student-popup").classList.add("is-hidden");

        document.querySelector(".js-student-popup-close-button").removeEventListener("click", closeStudentPopup);
    }

    function showStudentPopup() {
        // Show popup
        document.querySelector(".js-student-popup").classList.remove("is-hidden");

        // Add eventlistener to close popup
        document.querySelector(".js-student-popup-close-button").addEventListener("click", closeStudentPopup);
    }

    document.querySelector(".js-student-list").appendChild(templateClone);
}

function initButtons() {
    // Filter buttons
    document.querySelectorAll("[data-action=filter]").forEach((filterButton) => {
        filterButton.addEventListener("click", clickFilterButton);
    });

    // Sort buttons
    document.querySelectorAll("[data-action=sort]").forEach((sortButton) => {
        sortButton.addEventListener("click", clickSortButton);
    });
}

function clickFilterButton(event) {
    const buttonClicked = event.target.dataset.filter;
    console.log(`Sort by: ${buttonClicked}`);
}

function clickSortButton(event) {
    const buttonClicked = event.target.dataset.sort;
    console.log(`Sort by: ${buttonClicked}`);
}
