import { ArticleT, Contact, Journal, QnA } from "./Types";

export const applicationProperties = {
  title: "Pharmaceutical Updates by Chandrasekhar Panda",
  author: "Chandrasekhar Panda",
  startDate: "2022-02-01",
  appPassword: "JagaBaliaShreekhetra",
  fonts: [
    {
      font: "Source Serif 4",
      weights: [
        200,
        "200i",
        300,
        "300i",
        400,
        "400i",
        500,
        "500i",
        600,
        "600i",
        700,
        "700i",
        800,
        "800i",
        900,
        "900i",
      ],
    },
    {
      font: "Public Sans",
      weights: [
        200,
        "200i",
        300,
        "300i",
        400,
        "400i",
        500,
        "500i",
        600,
        "600i",
        700,
        "700i",
        800,
        "800i",
        900,
        "900i",
      ],
    },
    {
      font: "Noto Serif Display",
      weights: [
        200,
        "200i",
        300,
        "300i",
        400,
        "400i",
        500,
        "500i",
        600,
        "600i",
        700,
        "700i",
        800,
        "800i",
        900,
        "900i",
      ],
    },
    {
      font: "Merriweather",
      weights: [
        200,
        "200i",
        300,
        "300i",
        400,
        "400i",
        500,
        "500i",
        600,
        "600i",
        700,
        "700i",
        800,
        "800i",
        900,
        "900i",
      ],
    },
  ],
};

export const defaultArticle: ArticleT = {
  id: "",
  author: applicationProperties.author,
  title: "",
  dateCreated: new Date(),
  dateModified: new Date(),
  categryId: "Production",
  content: [],
  origin: "local",
  published: false,
};

export const defaultContact: Contact = {
  name: "",
  dateContacted: new Date(),
  email: "",
  phone: "",
  comment: "",
};

export const defaultJournal: Journal = {
  title: "zJournal Default Title",
  selectedPage: "home",
  currentArticle: defaultArticle,
  loggedIn: false,
  categories: [],
  components: [],
  templateArticles: [],
  templateData: "",
};

export const defaultQnA:QnA = {
  question:"",
  answer:"",
  id:"",
  published:false,
  dateCreated: new Date()
};

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
