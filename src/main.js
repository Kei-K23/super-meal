import axios from "axios";
import Aos, { refresh } from "aos";
import "aos/dist/aos.css";

Aos.init({
  duration: 1000,
  offset: 100,
});

const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchSubmitForm = document.getElementById("searchSubmitForm");
const mainContainer = document.querySelector(".main__container");
const searchResultContainer = document.querySelector(
  ".search_result__container"
);
const alertNotFoundMeal = document.querySelector(".alertNotFoundMeal");
const alertNotFoundMealAgain = document.querySelector(
  ".alertNotFoundMealAgain"
);

const modalSectionContainer = document.querySelector(
  ".modal__section__container"
);

const favMealLiContainer = document.querySelector(".favMealLiContainer");
const favMenuBox = document.querySelector(".favMenu__box");
const favContainerBtn = document.querySelector(".favContainerBtn");
const favContainerBtnIcon = document.querySelector(".fav_hamburger_menu > i");

favContainerBtn.addEventListener("click", () => {
  if (favMenuBox.dataset.hide === "hide") {
    while (favContainerBtnIcon.classList.length > 0) {
      favContainerBtnIcon.classList.remove(
        favContainerBtnIcon.classList.item(0)
      );
    }
    favContainerBtnIcon.classList.add(
      "fa-solid",
      "fa-xmark",
      "favContainerBtn"
    );
    favMenuBox.style.left = "0";
    favMenuBox.dataset.hide = "show";
  } else if (favMenuBox.dataset.hide === "show") {
    while (favContainerBtnIcon.classList.length > 0) {
      favContainerBtnIcon.classList.remove(
        favContainerBtnIcon.classList.item(0)
      );
    }
    favContainerBtnIcon.classList.add(
      "fa-solid",
      "fa-heart",
      "favContainerBtn"
    );
    favMenuBox.style.left = "-100%";
    favMenuBox.dataset.hide = "hide";
  }
});

const loadingIcon = document.createElement("i");
loadingIcon.classList.add("fa-solid", "fa-spinner", "fa-spin-pulse");
//request api endpoint
const URL = "https://www.themealdb.com/api/json/v1/1/random.php";
//meals array and push the data from api call
const MealsArray = [];
let storageFavMealArray = [];

function removeMealFromLocalStorage(removeItem) {
  const storedArrayString = localStorage.getItem("favMeal");

  storageFavMealArray = JSON.parse(storedArrayString);

  storageFavMealArray = storageFavMealArray.filter((m) => m !== removeItem);
  localStorage.setItem("favMeal", JSON.stringify(storageFavMealArray));
  storageFavMealArray.forEach(updateFavMealLiContainer);
}

async function showModalDetailForSpecificMeal(itemID) {
  const response = await axios.get(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${itemID}`
  );

  const data = response.data;
  createDialogElement(data.meals[0]);
  document.querySelector("dialog").showModal();
}

async function updateFavMealLiContainer(arr) {
  const response = await axios.get(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${arr}`
  );
  const data = await response.data;
  const { idMeal, strMealThumb, strMeal } = data.meals[0];

  const li = document.createElement("li");
  li.classList.add("favMealLi");

  const div = document.createElement("div");
  div.classList.add("favMealLiDiv");

  const img = document.createElement("img");
  img.classList.add("favMealLiImg");
  img.src = strMealThumb;
  img.alt = strMeal;

  const h2 = document.createElement("h2");
  h2.textContent = strMeal;
  h2.classList.add("favMealLih2");

  const hideDiv = document.createElement("div");
  hideDiv.classList.add("hideDiv");

  const viewBtn = document.createElement("button");
  viewBtn.classList.add("controlBtn", "viewBtn");
  viewBtn.innerText = "View";

  const viewIcon = document.createElement("i");
  viewIcon.classList.add("fa-solid", "fa-eye", "controlIcon");
  viewBtn.appendChild(viewIcon);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("controlBtn", "deleteBtn");
  deleteBtn.innerText = "Delete";

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-solid", "fa-trash-can", "controlIcon");
  deleteBtn.appendChild(deleteIcon);

  viewBtn.addEventListener("click", () =>
    showModalDetailForSpecificMeal(idMeal)
  );

  deleteBtn.addEventListener("click", () => {
    favMealLiContainer.innerHTML = "";
    const favCheckedInput = document.getElementById(`checked_${idMeal}`);
    removeMealFromLocalStorage(idMeal);
    if (favCheckedInput) {
      favCheckedInput.checked = false;
    }
  });

  li.addEventListener("mouseover", () => {
    hideDiv.style.display = "inline-block";
  });

  li.addEventListener("mouseout", () => {
    hideDiv.style.display = "none";
  });

  div.appendChild(img);
  div.appendChild(h2);

  hideDiv.appendChild(viewBtn);
  hideDiv.appendChild(deleteBtn);

  li.appendChild(hideDiv);
  li.appendChild(div);
  favMealLiContainer.appendChild(li);
}

document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the string from localStorage
  const storedArrayString = localStorage.getItem("favMeal");
  if (storedArrayString !== null) {
    // Convert the string back to an array using JSON.parse
    storageFavMealArray = JSON.parse(storedArrayString);
    if (storageFavMealArray.length === 0) {
      return;
    } else {
      storageFavMealArray.forEach((itemID) => updateFavMealLiContainer(itemID));
    }
  }
});

const getMealsByName = async (mealName) => {
  try {
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`
    );
    const resMealsData = response.data.meals;
    if (resMealsData !== null) {
      const newMealsDataArray = resMealsData.map((meal) => {
        return {
          mealId: meal.idMeal,
          mealName: meal.strMeal,
          mealCategory: meal.strCategory,
          mealImg: meal.strMealThumb,
        };
      });
      alertNotFoundMeal.innerText = null;
      alertNotFoundMealAgain.innerText = null;
      return newMealsDataArray;
    } else {
      alertNotFoundMeal.classList.add("alertNotFoundMeal");
      alertNotFoundMealAgain.classList.add("alertNotFoundMealAgain");
      alertNotFoundMeal.innerText = `"Sorry mate! There is no meal that named ${mealName} 😵‍💫"`;
      alertNotFoundMealAgain.innerText = `Try another delicious meal!`;
      document
        .querySelector(".search__info_container")
        .appendChild(alertNotFoundMeal);
      document
        .querySelector(".search__info_container")
        .appendChild(alertNotFoundMealAgain);
    }
  } catch (err) {
    console.error(err);
  } finally {
    console.log("finished fetch by meal name");
  }
};

searchSubmitForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  mainContainer.style.display = "none";
  searchResultContainer.style.display = "block";

  let nameOfMeal = document.getElementById("inputMeal");
  document.querySelector(
    ".search__header"
  ).textContent = `Your search meal: ${nameOfMeal.value}`;
  updateSearchMealsContainer(await getMealsByName(nameOfMeal.value));
  nameOfMeal.value = "";
});

document.getElementById("randomBtn").onclick = () => {
  searchResultContainer.style.display = "none";
};

function errorDisplaySection(err) {
  document.body.innerHTML = "";

  const errorMessage = document.createElement("h1");
  errorMessage.classList.add("errorMessage");
  errorMessage.textContent = err;

  const refreshBtn = document.createElement("button");
  refreshBtn.classList.add("refreshBtn");
  refreshBtn.textContent = "Try to refresh page!";

  document.body.appendChild(errorMessage);
  document.body.appendChild(refreshBtn);
  refreshBtn.onclick = () => {
    window.location.reload();
  };
}

const getMeals = async (url) => {
  try {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = "Loading ";
    loadMoreBtn.appendChild(loadingIcon);

    for (let i = 0; i < 4; i++) {
      const response = await axios.get(url);
      const resMealsData = response.data;

      const mealObj = {
        mealId: resMealsData.meals[0].idMeal,
        mealName: resMealsData.meals[0].strMeal,
        mealCategory: resMealsData.meals[0].strCategory,
        mealImg: resMealsData.meals[0].strMealThumb,
      };

      if (!MealsArray.length) {
        MealsArray.push(mealObj);
      } else {
        if (
          MealsArray.every((obj) => obj.mealId !== resMealsData.meals[0].idMeal)
        ) {
          MealsArray.push(mealObj);
        } else {
          await getMeals(URL);
        }
      }
    }
    return MealsArray;
  } catch (err) {
    errorDisplaySection(err.message);
  } finally {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = "More Meals";
  }
};

function produceMealInfoArray(tags) {
  const mealTagsArray = [];
  if (tags) {
    tags.split(",").forEach((tag) => {
      mealTagsArray.push(tag);
    });
  }

  return mealTagsArray;
}

function produceIngredientsArray(ingredients) {
  const mealIngredientsArray = [];
  for (let i = 1; i <= 20; i++) {
    if (ingredients[`strIngredient${i}`]) {
      mealIngredientsArray.push(ingredients[`strIngredient${i}`]);
    }
  }
  console.log(mealIngredientsArray);
  return mealIngredientsArray;
}

function produceMeasureArray(measures) {
  const mealMeasureArray = [];
  for (let i = 1; i <= 20; i++) {
    if (measures[`strMeasure${i}`]) {
      mealMeasureArray.push(measures[`strMeasure${i}`]);
    }
  }
  console.log(mealMeasureArray);
  return mealMeasureArray;
}

const createDialogElement = (specificMeal) => {
  const {
    strArea,
    strCategory,
    strTags,
    strMeal,
    strMealThumb,
    strInstructions,
    strYoutube,
  } = specificMeal;

  const mealTagsArray = produceMealInfoArray(strTags);
  const mealIngredientsArray = produceIngredientsArray(specificMeal);
  const mealMeasureArray = produceMeasureArray(specificMeal);
  const dialog = document.createElement("dialog");
  dialog.dataset.aos = "zoom-in-up";

  const closeIcon = document.createElement("i");
  closeIcon.classList.add("fa-regular", "fa-circle-xmark", "closeIcon");

  const h2 = document.createElement("h2");
  h2.classList.add("specific__mealName");
  h2.textContent = strMeal;

  const img = document.createElement("img");
  img.classList.add("specific__mealImg");
  img.src = strMealThumb;
  img.alt = "specific__mealImg";

  const ul = document.createElement("ul");
  ul.classList.add("specific__mealInfo_container");

  const li1 = document.createElement("li");
  li1.classList.add("specific__mealInfo");
  li1.textContent = `# ${strArea}`;

  const li2 = document.createElement("li");
  li2.classList.add("specific__mealInfo");
  li2.textContent = `# ${strCategory}`;

  ul.appendChild(li1);
  ul.appendChild(li2);

  if (mealTagsArray.length > 0 && Array.isArray(mealTagsArray)) {
    mealTagsArray.forEach((tag) => {
      const tagLi = document.createElement("li");
      tagLi.classList.add("specific__mealInfo");
      tagLi.textContent = `# ${tag}`;
      ul.appendChild(tagLi);
    });
  }

  const table = document.createElement("table");
  const tableRow = document.createElement("tr");

  const tableHeader1 = document.createElement("th");
  tableHeader1.textContent = "No.";

  const tableHeader2 = document.createElement("th");
  tableHeader2.textContent = "Ingredient";

  const tableHeader3 = document.createElement("th");
  tableHeader3.textContent = "Measure";

  tableRow.appendChild(tableHeader1);
  tableRow.appendChild(tableHeader2);
  tableRow.appendChild(tableHeader3);

  table.appendChild(tableRow);

  if (
    mealIngredientsArray.length > 0 &&
    mealMeasureArray.length > 0 &&
    Array.isArray(mealIngredientsArray) &&
    Array.isArray(mealMeasureArray)
  ) {
    for (let i = 0; i < mealIngredientsArray.length; i++) {
      const tableRow = document.createElement("tr");

      const tableData1 = document.createElement("td");
      tableData1.textContent = i + 1;

      const tableData2 = document.createElement("td");
      tableData2.textContent = mealIngredientsArray[i];

      const tableData3 = document.createElement("td");
      tableData3.textContent = mealMeasureArray[i];

      tableRow.appendChild(tableData1);
      tableRow.appendChild(tableData2);
      tableRow.appendChild(tableData3);

      table.appendChild(tableRow);
    }
  }

  const instructionLabel = document.createElement("p");
  instructionLabel.classList.add("instructionLabel");
  instructionLabel.textContent = "📜 Instruction 📜";

  const p = document.createElement("p");
  p.classList.add("specific__mealInstruction");
  p.textContent = strInstructions;

  const modalCloseBtn = document.createElement("button");
  modalCloseBtn.id = "modalCloseBtn";
  modalCloseBtn.textContent = "close";

  closeIcon.addEventListener("click", () => {
    document.querySelector("dialog").close();
    dialog.remove();
  });

  dialog.appendChild(closeIcon);
  dialog.appendChild(img);
  if (strYoutube) {
    const youTubeLink = document.createElement("a");
    youTubeLink.classList.add("youTubeLink");
    youTubeLink.textContent = `YouTube link for ${strMeal}`;
    youTubeLink.href = strYoutube;
    youTubeLink.target = "_blank";
    dialog.appendChild(youTubeLink);
  }

  dialog.appendChild(h2);
  dialog.appendChild(ul);
  dialog.appendChild(table);
  dialog.appendChild(instructionLabel);
  dialog.appendChild(p);

  modalSectionContainer.appendChild(dialog);
};

const createMealItem = (meal) => {
  if (meal) {
    const mealElement = document.createElement("li");
    mealElement.setAttribute(
      "title",
      "double click to see detail about meal..."
    );
    mealElement.classList.add("meal");
    mealElement.dataset.aos = "flip-left";
    mealElement.setAttribute("id", meal.mealId);
    const mealImgEle = document.createElement("img");
    mealImgEle.classList.add("img");
    mealImgEle.setAttribute("src", meal.mealImg);
    mealImgEle.setAttribute("alt", "Meal Img");

    mealElement.appendChild(mealImgEle);

    const mealMainInfoEle = document.createElement("div");
    mealMainInfoEle.classList.add("mealMainInfoEle");

    const mealInfoEle = document.createElement("div");
    const mealNameEle = document.createElement("p");
    mealNameEle.classList.add("mealNameEle");
    mealNameEle.textContent = meal.mealName;
    mealInfoEle.appendChild(mealNameEle);

    const mealCateEle = document.createElement("p");
    mealCateEle.classList.add("mealCateEle");
    mealCateEle.textContent = meal.mealCategory;
    mealInfoEle.appendChild(mealCateEle);

    const favCheckDivEle = document.createElement("div");
    favCheckDivEle.classList.add("checkContainer");

    const favMealCheckEle = document.createElement("input");
    favMealCheckEle.id = `checked_${meal.mealId}`;
    favMealCheckEle.setAttribute("type", "checkbox");

    const storageFavMeal = localStorage.getItem("favMeal");
    if (storageFavMeal !== null) {
      JSON.parse(storageFavMeal).forEach((mealID) => {
        if (mealID === meal.mealId) {
          favMealCheckEle.checked = true;
        }
      });
    }

    const favMealLabelEle = document.createElement("label");
    favMealLabelEle.classList.add("favLabel");
    favMealLabelEle.setAttribute("for", `checked_${meal.mealId}`);

    const heartIcon = document.createElement("i");
    heartIcon.classList.add("fa-solid", "fa-heart");
    favMealLabelEle.appendChild(heartIcon);

    favCheckDivEle.appendChild(favMealCheckEle);
    favCheckDivEle.appendChild(favMealLabelEle);

    mealMainInfoEle.appendChild(mealInfoEle);
    mealMainInfoEle.appendChild(favCheckDivEle);
    mealElement.appendChild(mealMainInfoEle);

    mealElement.addEventListener("dblclick", async (e) => {
      if (e.target.matches("i")) {
        // Omit further actions for the checkbox
        return;
      }
      const liEle = e.currentTarget;
      const liId = liEle.getAttribute("id");
      await showModalDetailForSpecificMeal(liId);
    });

    favMealCheckEle.addEventListener("change", (e) => {
      if (e.target.checked) {
        storageFavMealArray.push(mealElement.id);
        const storageFavMeal = localStorage.getItem("favMeal");
        if (!storageFavMeal) {
          localStorage.setItem("favMeal", JSON.stringify(storageFavMealArray));
          document.querySelector(".favMealLiContainer").innerHTML = "";

          storageFavMealArray.forEach(updateFavMealLiContainer);
        } else {
          localStorage.setItem("favMeal", JSON.stringify(storageFavMealArray));
          document.querySelector(".favMealLiContainer").innerHTML = "";

          storageFavMealArray.forEach(updateFavMealLiContainer);
        }
      } else {
        document.querySelector(".favMealLiContainer").innerHTML = "";
        removeMealFromLocalStorage(meal.mealId);
      }
    });

    return mealElement;
  } else {
    return 1;
  }
};

const updateMealsContainer = (meals) => {
  const mealsContainer = document.getElementById("meal__container");
  mealsContainer.innerHTML = null;

  if (Array.isArray(meals) && meals.length > 0) {
    meals.forEach((meal) => {
      mealsContainer.appendChild(createMealItem(meal));
    });
  } else {
    mealsContainer.appendChild(createMealItem(meals));
  }
};

const updateSearchMealsContainer = (meals) => {
  const searchMealsContainer = document.getElementById(
    "search_meal__container"
  );
  searchMealsContainer.innerHTML = null;
  if (Array.isArray(meals) && meals.length > 0) {
    meals.forEach((meal) => {
      searchMealsContainer.appendChild(createMealItem(meal));
    });
  } else {
    searchMealsContainer.appendChild(createMealItem(meals));
  }
};

const main = async () => {
  updateMealsContainer(await getMeals(URL));
};

main();

loadMoreBtn.addEventListener("click", async () => {
  updateMealsContainer(await getMeals(URL));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelector("dialog").remove();
  }
});

window.addEventListener("scroll", () => {
  let scrollFromTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  if (scrollFromTop > 250) {
    document.querySelector("header").classList.add("headerChangeTheme");
  } else if (scrollFromTop < 250) {
    document.querySelector("header").classList.remove("headerChangeTheme");
  }
});
