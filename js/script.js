"use strict";

window.addEventListener("DOMContentLoaded", init);

let allStudents = [];
let bloodStatus = [];
// TODO: Hopefully not needed
let unfilteredStudents;

const Student = {
    id: null,
    fullname: "",
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
            student.fullname += student.firstname;
        } else {
            const findFirstName = fullname.substring(0, firstSpaceInFullName);
            firstNameFirstLetter = findFirstName[0].toUpperCase();
            const firstNameAfterFirstLetter = findFirstName.substring(1);
            firstName = firstNameFirstLetter + firstNameAfterFirstLetter;
            student.firstname = firstNameFirstLetter + firstNameAfterFirstLetter;
            student.fullname += student.firstname;
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
                student.fullname += ` ${student.nickname}`;

                // Else middlename
            } else {
                const middlePartOfNameFirstLetter = middlePartOfName[0].toUpperCase();
                const middlePartOfNameAfterFirstLetter = middlePartOfName.substring(1);
                student.middlename = middlePartOfNameFirstLetter + middlePartOfNameAfterFirstLetter;
                student.nickname = null;
                student.fullname += ` ${student.middlename}`;
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
                student.fullname += ` ${student.lastname}`;

                // Else has hyphen
            } else {
                const lastNameFirstLetter = lastName[0].toUpperCase();
                const beforeHyphenUppercase = lastName.substring(1, hasLastNameHyphen + 1);
                const hyphenUppercase = lastName[hasLastNameHyphen + 1].toUpperCase();
                afterHyphenUppercase = lastName.substring(hasLastNameHyphen + 2);

                student.lastname = lastNameFirstLetter + beforeHyphenUppercase + hyphenUppercase + afterHyphenUppercase;
                student.fullname += ` ${student.lastname}`;
            }
        } else {
            student.fullname += ` ${student.lastname}`;
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

        // Set bloodstatus
        if (!familyBloodStatus.half && familyBloodStatus.pure) {
            student.bloodstatus = "Pure-blood";
        } else if (familyBloodStatus.half && familyBloodStatus.pure) {
            student.bloodstatus = "Half-blood";
        } else {
            student.bloodstatus = "Muggle";
        }

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

    updateHogwartsOverview(sortedList);
}

function displayList(students) {
    // Reset list
    document.querySelector(".js-student-list").innerHTML = "";
    document.querySelector(".js-expelled-student-list").innerHTML = "";

    // Loop through every student and display them on the screen
    students.forEach(displayStudent);
}

function displayStudent(student) {
    const templateClone = templates.student.cloneNode(true);
    const studentPopup = document.querySelector(".js-student-popup");

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
    templateClone.querySelector(".c-student").addEventListener("click", clickStudent);
    // templateClone.querySelector("[data-action=squad]").addEventListener("click", clickSquadButton);

    if (student.expelled) {
        document.querySelector(".js-expelled-student-list").appendChild(templateClone);
    } else {
        document.querySelector(".js-student-list").appendChild(templateClone);
    }

    function clickStudent() {
        console.log(student);

        // Inserts student data into the popup
        prepareStudentPopup(student);
        // Shows the popup with the inserted data of the student
        showStudentPopup();
    }

    function closeStudentPopup() {
        studentPopup.classList.add("is-hidden");

        studentPopup.querySelector(".js-student-popup-close-button").removeEventListener("click", closeStudentPopup);
        studentPopup.querySelector("[data-action=prefect]").removeEventListener("click", clickPrefectButton);
        studentPopup.querySelector("[data-action=squad]").removeEventListener("click", clickSquadButton);
    }

    function showStudentPopup() {
        // Show popup
        studentPopup.classList.remove("is-hidden");

        // Add eventlistener to close popup
        studentPopup.querySelector(".js-student-popup-close-button").addEventListener("click", closeStudentPopup);
        studentPopup.querySelector("[data-action=prefect]").addEventListener("click", clickPrefectButton);
        studentPopup.querySelector("[data-action=squad]").addEventListener("click", clickSquadButton);
        studentPopup.querySelector("[data-action=expell]").addEventListener("click", clickExpellButton);
    }

    function clickPrefectButton() {
        if (student.prefect) {
            student.prefect = false;
        } else {
            tryToMakeStudentPrefect(student);
        }

        buildList();
        prepareStudentPopup(student);
    }

    function clickSquadButton() {
        if (student.squad) {
            student.squad = false;
        } else {
            tryToAddStudentToSquad(student);
        }

        buildList();
        prepareStudentPopup(student);
    }

    function clickExpellButton() {
        student.expelled = true;
        student.prefect = false;
        student.squad = false;

        buildList();
        prepareStudentPopup(student);
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
    const prefectsFromHouse = allStudents.filter((student) => student.house === selectedStudent.house && student.prefect);
    const numberOfPrefects = prefectsFromHouse.length;

    if (numberOfPrefects >= 2) {
        console.log("There can only be two prefects for each house!");
        // TODO: Add modal to remove either A, B or do nothing
        removeAorB(prefectsFromHouse[0], prefectsFromHouse[1]);
    } else {
        console.log("Student added");
        selectedStudent.prefect = true;
    }

    function removeAorB(prefectA, prefectB) {
        console.table(prefectA);
        console.table(prefectB);

        const modal = document.querySelector(".js-student-modal-prefect");

        const buttonA = modal.querySelector("[data-action=prefecta]");
        const buttonB = modal.querySelector("[data-action=prefectb]");

        const buttonCancel = modal.querySelector("[data-action=cancel]");
        const buttonClose = modal.querySelector(".js-student-modal-prefect-close-button");

        // Show student name under image
        modal.querySelector("[data-field=prefecta-name]").textContent = prefectA.fullname;
        modal.querySelector("[data-field=prefectb-name]").textContent = prefectB.fullname;
        // Show student A and B name in buttons
        buttonA.querySelector("[data-field=prefecta]").textContent = prefectA.fullname;
        buttonB.querySelector("[data-field=prefectb]").textContent = prefectB.fullname;
        // Show student image
        modal.querySelector("[data-field=prefecta-image]").src = prefectA.image;
        modal.querySelector("[data-field=prefectb-image]").src = prefectB.image;

        // Button A or B, remove and add prefect
        buttonA.addEventListener("click", clickRemovePrefectA);
        buttonB.addEventListener("click", clickRemovePrefectB);

        // Cancel or close button, close modal
        buttonCancel.addEventListener("click", closeDialog);
        buttonClose.addEventListener("click", closeDialog);

        // Show modal
        modal.classList.remove("is-hidden");

        function closeDialog() {
            buttonA.removeEventListener("click", clickRemovePrefectA);
            buttonB.removeEventListener("click", clickRemovePrefectB);
            buttonCancel.removeEventListener("click", closeDialog);
            buttonClose.removeEventListener("click", closeDialog);

            modal.classList.add("is-hidden");
        }

        function clickRemovePrefectA() {
            removePrefectA(prefectA);
            addPrefect(selectedStudent);
            buildList();

            prepareStudentPopup(selectedStudent);
            closeDialog();
        }

        function clickRemovePrefectB() {
            removePrefectB(prefectB);
            addPrefect(selectedStudent);
            buildList();

            prepareStudentPopup(selectedStudent);
            closeDialog();
        }

        function removePrefectA(student) {
            student.prefect = false;
        }

        function removePrefectB(student) {
            student.prefect = false;
        }

        function addPrefect(student) {
            student.prefect = true;
        }
    }
}

function tryToAddStudentToSquad(selectedStudent) {
    console.log(selectedStudent);

    if (selectedStudent.house.toLowerCase() === "slytherin" || selectedStudent.bloodstatus.toLowerCase() === "pure-blood") {
        console.log(`Student is ${selectedStudent.house} and ${selectedStudent.bloodstatus}`);
        selectedStudent.squad = true;
    } else {
        console.log("Student cannot be added to InQ Squad, because: ");
        console.log(`Student is ${selectedStudent.house} and ${selectedStudent.bloodstatus}`);
    }
}

function prepareStudentPopup(student) {
    const studentPopup = document.querySelector(".js-student-popup");

    // Set house colors
    const header = studentPopup.querySelector(".c-student-popup__header");
    const headerContent = studentPopup.querySelector(".c-student-popup__header-content");

    if (student.house.toLowerCase() === "slytherin") {
        header.style.setProperty("--diamond-color", "#2A623D");
        headerContent.style.setProperty("--house-border", "#5D5D5D");
    } else if (student.house.toLowerCase() === "hufflepuff") {
        header.style.setProperty("--diamond-color", "#FFDB00");
        headerContent.style.setProperty("--house-border", "#60605C");
    } else if (student.house.toLowerCase() === "ravenclaw") {
        header.style.setProperty("--diamond-color", "#222F5B");
        headerContent.style.setProperty("--house-border", "#946B2D");
    } else {
        header.style.setProperty("--diamond-color", "#AE0001");
        headerContent.style.setProperty("--house-border", "#D3A625");
    }

    // Image
    studentPopup.querySelector("[data-field=profile-image]").src = student.image;
    // Name
    studentPopup.querySelector("[data-field=name]").textContent = student.fullname;
    // ID
    studentPopup.querySelector("[data-field=id]").textContent = `#${student.id}`;
    // Gender
    studentPopup.querySelector("[data-field=gender]").textContent = student.gender;
    // House
    studentPopup.querySelector("[data-field=house]").src = `img/shield-${student.house.toLowerCase()}.png`;
    // Blood status
    studentPopup.querySelector("[data-field=blood-status]").textContent = student.bloodstatus;

    // Prefetch status
    if (student.prefect) {
        studentPopup.querySelector("[data-field=prefect]").textContent = "Yes";
        studentPopup.querySelector("[data-field=prefect-image]").classList.add("is-active");
        studentPopup.querySelector("[data-action=prefect]").innerHTML = 'Remove as Prefect<i class="fas fa-minus-circle"></i>';
    } else {
        studentPopup.querySelector("[data-field=prefect]").textContent = "No";
        studentPopup.querySelector("[data-field=prefect-image]").classList.remove("is-active");
        studentPopup.querySelector("[data-action=prefect]").innerHTML = 'Add as Prefect<i class="fas fa-plus-circle"></i>';
    }
    studentPopup.querySelector("[data-field=prefect-image]").src = "img/shield-prefect.png";

    // Squad status
    if (student.squad) {
        studentPopup.querySelector("[data-field=squad]").textContent = "Yes";
        studentPopup.querySelector("[data-field=squad-image]").classList.add("is-active");
        studentPopup.querySelector("[data-action=squad]").innerHTML = 'Remove from Squad<i class="fas fa-minus-circle"></i>';
    } else {
        studentPopup.querySelector("[data-field=squad]").textContent = "No";
        studentPopup.querySelector("[data-field=squad-image]").classList.remove("is-active");
        studentPopup.querySelector("[data-action=squad]").innerHTML = 'Add to Squad<i class="fas fa-plus-circle"></i>';
    }
    studentPopup.querySelector("[data-field=squad-image]").src = "img/squad-medal.png";

    // Expelled status
    if (student.expelled) {
        studentPopup.querySelector("[data-field=expelled]").textContent = "Yes";
        studentPopup.querySelector("[data-action=expell]").innerHTML = "Already expelled";
        studentPopup.querySelector("[data-action=expell]").disabled = true;
    } else {
        studentPopup.querySelector("[data-field=expelled]").textContent = "No";
        studentPopup.querySelector("[data-action=expell]").innerHTML = 'Expell Student <i class="fas fa-exclamation-triangle">';
        studentPopup.querySelector("[data-action=expell]").disabled = false;
    }
}

function updateHogwartsOverview(sortedList) {
    console.log("YAY!");

    const hogwarts = document.querySelector(".js-house-status-hogwarts");
    const slytherin = document.querySelector(".js-house-status-slytherin");
    const hufflepuff = document.querySelector(".js-house-status-hufflepuff");
    const ravenclaw = document.querySelector(".js-house-status-ravenclaw");
    const gryffindor = document.querySelector(".js-house-status-gryffindor");

    showOverviewStats();

    function showOverviewStats() {
        // Whole school data
        hogwarts.querySelector("[data-field=number-of-students]").textContent = allStudents.length;
        hogwarts.querySelector("[data-field=number-of-active-students]").textContent = allStudents.filter((student) => student.expelled === false).length;
        hogwarts.querySelector("[data-field=number-of-expelled-students]").textContent = allStudents.filter((student) => student.expelled === true).length;

        // Slytherin house
        const slytherinStudents = allStudents.filter((student) => student.house.toLowerCase() === "slytherin");
        slytherin.querySelector("[data-field=number-of-students]").textContent = slytherinStudents.length;
        slytherin.querySelector("[data-field=number-of-active-students]").textContent = slytherinStudents.filter((student) => student.expelled === false).length;
        slytherin.querySelector("[data-field=number-of-expelled-students]").textContent = slytherinStudents.filter((student) => student.expelled === true).length;

        // Hufflepuff house
        const hufflepuffStudents = allStudents.filter((student) => student.house.toLowerCase() === "hufflepuff");
        hufflepuff.querySelector("[data-field=number-of-students]").textContent = hufflepuffStudents.length;
        hufflepuff.querySelector("[data-field=number-of-active-students]").textContent = hufflepuffStudents.filter((student) => student.expelled === false).length;
        hufflepuff.querySelector("[data-field=number-of-expelled-students]").textContent = hufflepuffStudents.filter((student) => student.expelled === true).length;

        // Ravenclaw house
        const ravenclawStudents = allStudents.filter((student) => student.house.toLowerCase() === "ravenclaw");
        ravenclaw.querySelector("[data-field=number-of-students]").textContent = ravenclawStudents.length;
        ravenclaw.querySelector("[data-field=number-of-active-students]").textContent = ravenclawStudents.filter((student) => student.expelled === false).length;
        ravenclaw.querySelector("[data-field=number-of-expelled-students]").textContent = ravenclawStudents.filter((student) => student.expelled === true).length;

        // Gryffindor house
        const gryffindorStudents = allStudents.filter((student) => student.house.toLowerCase() === "gryffindor");
        gryffindor.querySelector("[data-field=number-of-students]").textContent = gryffindorStudents.length;
        gryffindor.querySelector("[data-field=number-of-active-students]").textContent = gryffindorStudents.filter((student) => student.expelled === false).length;
        gryffindor.querySelector("[data-field=number-of-expelled-students]").textContent = gryffindorStudents.filter((student) => student.expelled === true).length;
    }
}
