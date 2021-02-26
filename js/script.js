"use strict";

window.addEventListener("DOMContentLoaded", init);

let allStudents = [];
let bloodStatus = [];
// TODO: Hopefully not needed
let unfilteredStudents;

const Student = {
    id: null,
    fullname: "-unknown-",
    firstname: "-unknown-",
    middlename: "-unknown-",
    nickname: null,
    lastname: "-unknown-",
    gender: undefined,
    bloodstatus: null,
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
    sortBy: "firstname",
    sortDir: "asc",
    filterBy: "all",
};

const urls = {
    studentList: "https://petlatkea.dk/2021/hogwarts/students.json",
    bloodStatus: "https://petlatkea.dk/2021/hogwarts/families.json",
};

async function init() {
    console.log("init");

    // get students unfiltered
    unfilteredStudents = await loadJSON(urls.studentList);
    // get blood statuses
    bloodStatus = await loadJSON(urls.bloodStatus);

    // Prepare student objects
    prepareObjects(unfilteredStudents);

    // Start filter and sort buttons
    initButtons();
}

async function loadJSON(url) {
    console.log("loadJSON");

    const getData = await fetch(url);
    const response = await getData.json();

    return response;
}

// TODO: Clean up
// One function for each part
function prepareObjects(jsonData) {
    console.log("prepareObjects");

    jsonData.forEach((jsonObject, index) => {
        const student = Object.create(Student);

        const fullname = jsonObject.fullname.toLowerCase().trim();
        const firstSpaceInFullName = fullname.indexOf(" ");
        const lastSpaceInFullName = fullname.lastIndexOf(" ");
        const checkForHyphen = fullname.indexOf("-");

        // ID
        student.id = index + 1;

        let firstName;
        let firstNameFirstLetter;
        // Firstname
        if (firstSpaceInFullName === -1) {
            firstNameFirstLetter = fullname[0].toUpperCase();
            const firstNameAfterFirstLetter = fullname.substring(1);
            firstName = firstNameFirstLetter + firstNameAfterFirstLetter;
            student.firstname = firstNameFirstLetter + firstNameAfterFirstLetter;
        } else {
            const findFirstName = fullname.substring(0, firstSpaceInFullName);
            firstNameFirstLetter = findFirstName[0].toUpperCase();
            const firstNameAfterFirstLetter = findFirstName.substring(1);
            firstName = firstNameFirstLetter + firstNameAfterFirstLetter;
            student.firstname = firstNameFirstLetter + firstNameAfterFirstLetter;
        }

        let middlePartOfName = fullname.substring(firstSpaceInFullName, lastSpaceInFullName).trim();
        // Middlename or nickname exists
        if (middlePartOfName) {
            // If nickname
            if (middlePartOfName.startsWith('"')) {
                middlePartOfName = middlePartOfName.replaceAll('"', "");

                const middlePartOfNameFirstLetter = middlePartOfName[0].toUpperCase();
                const middlePartOfNameAfterFirstLetter = middlePartOfName.substring(1);
                student.nickname = middlePartOfNameFirstLetter + middlePartOfNameAfterFirstLetter;
                student.middleName = null;

                // Else middlename
            } else {
                const middlePartOfNameFirstLetter = middlePartOfName[0].toUpperCase();
                const middlePartOfNameAfterFirstLetter = middlePartOfName.substring(1);
                student.middlename = middlePartOfNameFirstLetter + middlePartOfNameAfterFirstLetter;
                student.nickname = null;
            }
        } else {
            student.middlename = null;
            student.nickname = null;
        }

        // Lastname
        const lastName = fullname.substring(lastSpaceInFullName).trim();
        let hasLastNameHyphen;
        let afterHyphenUppercase;

        if (firstName.toLowerCase() !== lastName.toLowerCase()) {
            hasLastNameHyphen = lastName.indexOf("-");
            // If no hyphen
            if (hasLastNameHyphen === -1) {
                const lastNameFirstLetter = lastName[0].toUpperCase();
                const lastNameAfterFirstLetter = lastName.substring(1);
                student.lastname = lastNameFirstLetter + lastNameAfterFirstLetter;
                // Else has hyphen
            } else {
                const lastNameFirstLetter = lastName[0].toUpperCase();
                const beforeHyphenUppercase = lastName.substring(1, hasLastNameHyphen + 1);
                const hyphenUppercase = lastName[hasLastNameHyphen + 1].toUpperCase();
                afterHyphenUppercase = lastName.substring(hasLastNameHyphen + 2);

                student.lastname = lastNameFirstLetter + beforeHyphenUppercase + hyphenUppercase + afterHyphenUppercase;
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

        // Bloodstatus
        const familyBloodStatus = {
            half: false,
            pure: false,
        };

        familyBloodStatus.half = bloodStatus.half.includes(student.lastname);
        familyBloodStatus.pure = bloodStatus.pure.includes(student.lastname);

        console.log(familyBloodStatus);
        // Set bloodstatus
        if (!familyBloodStatus.half && familyBloodStatus.pure) {
            student.bloodstatus = "Pure-blood";
        } else if (familyBloodStatus.half && familyBloodStatus.pure) {
            student.bloodstatus = "Half-blood";
        } else {
            student.bloodstatus = "Muggle";
        }

        console.log(student.bloodstatus);

        // Image
        let multipleWithTheSameLastName = 0;
        unfilteredStudents.forEach((unfilteredStudent) => {
            const lastSpace = unfilteredStudent.fullname.lastIndexOf(" ");
            const lastName = unfilteredStudent.fullname
                .substring(lastSpace + 1)
                .trim()
                .toLowerCase();

            if (lastName === student.lastname.toLowerCase()) {
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
            student.image = `img/${lastName}_${firstName.toLowerCase()}.png`;
        } else {
            student.image = `img/${lastName}_${firstNameFirstLetter.toLowerCase()}.png`;
        }
        // Add student to allStudent list
        allStudents.push(student);
    });

    buildList();
}

function buildList() {
    // Filter the list
    const filteredList = filterList(allStudents);

    // TODO: Take the filtered list and sort it
    const sortedList = sortList(filteredList);

    // Display the list
    displayList(sortedList);
}

function displayList(students) {
    // Reset list
    document.querySelector(".js-student-list").innerHTML = "";

    // Loop through every student and display them on the screen
    students.forEach(displayStudent);
}

function displayStudent(student) {
    const templateClone = templates.student.cloneNode(true);

    // Student ID
    templateClone.querySelector(".c-student__id-cell").innerHTML = `#${student.id}`;

    // Profile image
    templateClone.querySelector(".c-student__profile-image").src = student.image;
    // First name
    templateClone.querySelector(".c-student__first-name-cell").textContent = student.firstname;
    // Last name
    templateClone.querySelector(".c-student__last-name-cell").textContent = student.lastname;

    // Gender
    if (student.gender.toLowerCase() === "boy") {
        templateClone.querySelector(".c-student__gender-cell").innerHTML = '<i class="c-student__boy-icon [ fas fa-mars ]"></i>';
    } else {
        templateClone.querySelector(".c-student__gender-cell").innerHTML = '<i class="c-student__girl-icon [ fas fa-venus ]"></i>';
    }

    // House image
    templateClone.querySelector(".c-student__house-image").src = `img/shield-${student.house.toLowerCase()}.png`;

    // Prefect
    templateClone.querySelector(".c-student__prefect-image").src = "img/shield-prefect.png";
    // If student is prefect - highlight prefect icon
    if (student.prefect) {
        templateClone.querySelector(".c-student__prefect-image").classList.add("is-active");
    }

    // Squad
    templateClone.querySelector(".c-student__squad-image").src = "img/squad-medal.png";
    // If student is a part of the squad
    if (student.squad) {
        templateClone.querySelector(".c-student__squad-image").classList.add("is-active");
    }

    // Show popup if click on student
    templateClone.querySelector(".c-student__details-cell").addEventListener("click", clickStudent);

    templateClone.querySelector("[data-action=prefect]").addEventListener("click", clickPrefectButton);
    templateClone.querySelector("[data-action=squad]").addEventListener("click", clickSquadButton);

    document.querySelector(".js-student-list").appendChild(templateClone);

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
        studentPopup.querySelector("[data-field=blood-status]").textContent = student.bloodstatus;

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

    function clickPrefectButton() {
        if (student.prefect) {
            student.prefect = false;
        } else {
            tryToMakeStudentPrefect(student);
        }

        buildList();
    }

    function clickSquadButton() {
        if (student.squad) {
            student.squad = false;
        } else {
            student.squad = true;
        }
        console.log(`InQ squad: ${student.squad}`);
        buildList();
    }
}

function initButtons() {
    // Filter buttons
    const filterButtons = document.querySelectorAll("[data-action=filter]");
    filterButtons.forEach((filterButton) => {
        filterButton.addEventListener("click", clickFilterButton);
    });

    // Sort buttons
    const sortButtons = document.querySelectorAll("[data-action=sort]");
    sortButtons.forEach((sortButton) => {
        sortButton.addEventListener("click", clickSortButton);
    });

    function clickFilterButton(event) {
        const buttonClicked = event.target;
        const filterClicked = buttonClicked.dataset.filter;

        filterButtons.forEach((filterButton) => filterButton.classList.remove("is-active"));
        buttonClicked.classList.add("is-active");

        setFilter(filterClicked);
    }

    function clickSortButton(event) {
        const buttonClicked = event.target;
        const sortClicked = buttonClicked.dataset.sort;
        const sortDirClicked = buttonClicked.dataset.sortDirection;

        sortButtons.forEach((sortButton) => sortButton.classList.remove("is-active"));
        buttonClicked.classList.add("is-active");

        if (sortDirClicked === "asc") {
            event.target.dataset.sortDirection = "desc";
        } else {
            event.target.dataset.sortDirection = "asc";
        }

        setSort(sortClicked, sortDirClicked);
    }
}

function setFilter(filter) {
    // Update the filter
    settings.filterBy = filter;

    // Build the list again with the updated filter
    buildList();
}

function filterList(filteredList) {
    filteredList = allStudents.filter(filterByProperty);

    return filteredList;
}

function filterByProperty(student) {
    if (settings.filterBy === "all") {
        return true;
    } else {
        return student.house.toLowerCase() === settings.filterBy;
    }
}

function setSort(sortBy, sortDir) {
    settings.sortBy = sortBy;
    settings.sortDir = sortDir;
    console.log(sortBy);

    buildList();
}

function sortList(sortedList) {
    let direction = 1;

    if (settings.sortDir === "desc") {
        direction = -1;
    } else {
        direction = 1;
    }

    sortedList = sortedList.sort(sortByProperty);

    function sortByProperty(studentA, studentB) {
        if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
            return -1 * direction;
        } else {
            return 1 * direction;
        }
    }

    return sortedList;
}

function tryToMakeStudentPrefect(selectedStudent) {
    console.log(selectedStudent);
    const prefectsFromHouse = allStudents.filter((student) => student.house === selectedStudent.house && student.prefect);
    console.table(prefectsFromHouse);
    const numberOfPrefects = prefectsFromHouse.length;

    if (numberOfPrefects >= 2) {
        console.log("There can only be two prefects for each house!");
        // TODO: Add modal to remove either A, B or do nothing
    } else {
        console.log("Student added");
        selectedStudent.prefect = true;
    }
}
