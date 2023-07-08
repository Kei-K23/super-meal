import axios from "axios";
import Aos from "aos";

const inputName = document.getElementById("inputName");
const inputEmail = document.getElementById("inputEmail");
const inputSubject = document.getElementById("inputSubject");
const inputText = document.getElementById("inputText");
const emailDialogInfo = document.querySelector(".emailDialogInfo");

const messageInfo = document.querySelector(".messageInfo");

Aos.init({
  duration: 1000,
  offset: 100,
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

// Add submit event listener to the form

function contactFormSubmit(name, email, subject, text) {
  document.querySelector(".form").addEventListener("submit", async (event) => {
    event.preventDefault();

    // Retrieve input values
    const iName = name.value;
    const iEmail = email.value;
    const iSubject = subject.value;
    const iMessage = text.value;

    const response = await axios.get(
      `https://emailvalidation.abstractapi.com/v1/?api_key=9b35c5772a1d4948a74b09cb2fcfe3fe&email=${iEmail}`
    );
    const data = response.data;
    console.log(data);
    if (data.is_valid_format.value && data.is_smtp_valid.value) {
      axios.defaults.headers.post["Content-Type"] = "application/json";
      axios
        .post("https://formsubmit.co/ajax/arkar1712luffy@gmail.com", {
          name: iName,
          email: iEmail,
          subject: iSubject,
          message: iMessage,
        })
        .then((response) => {
          displayMessage(response.data.message);
          emailDialogInfo.style.backgroundColor = "#00ce00";
          setTimeout(hideMessage, 2000);
        })
        .catch((_error) => {
          displayMessage();
          emailDialogInfo.style.backgroundColor = "red";
          setTimeout(hideMessage, 2000);
        });
    } else {
      displayMessage("Invalid Email!");
      emailDialogInfo.style.backgroundColor = "red";
      setTimeout(hideMessage, 2000);
    }

    inputName.value = "";
    inputEmail.value = "";
    inputSubject.value = "";
    inputText.value = "";
  });
}

contactFormSubmit(inputName, inputEmail, inputSubject, inputText);

function displayMessage(message = "Error during sending email!") {
  emailDialogInfo.style.display = "block";
  messageInfo.textContent = message;
}

function hideMessage() {
  emailDialogInfo.style.display = "none";
  messageInfo.textContent = "";
}
