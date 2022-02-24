import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./Home";
import Article from "./components/Article/Article";

import { ArticleT } from "../Types";

const articleObject: ArticleT = {
  id: "987391391bbjgj27819391",
  title: "Article Topic Header",
  categryId: "Microbiology",
  author: "Piyush Plaban Praharaj",
  dateCreated: new Date(),
  dateModified: new Date(),
  content: [
    {
      componenType: "Image",
      data: "https://learn-biology.com/wp-content/uploads/2018/12/05a_genetic-engineering-overview-lettered.png",
      altText: "None",
    },
    {
      componenType: "h4",
      data: "Abstract",
    },
    {
      componenType: "Paragraph",
      data: "Time delay arising in a genetic regulatory network may cause the instability. This paper is concerned with the stability analysis of genetic regulatory networks with interval time-varying delays. Firstly, a relaxed double integral inequality, named as Wirtinger-type double integral inequality (WTDII), is established to estimate the double integral term appearing in the derivative of Lyapunov-Krasovskii functional with a triple integral term. And it is proved theoretically that the proposed WTDII is tighter than the widely used Jensen-based double inequality and the recently developed Wiringter-based double inequality. Then, by applying the WTDII to the stability analysis of a delayed genetic regulatory network, together with the usage of useful information of regulatory functions, several delay-range- and delay-rate-dependent (or delay-rate-independent) criteria are derived in terms of linear matrix inequalities. Finally, an example is carried out to verify the effectiveness of the proposed method and also to show the advantages of the established stability criteria through the comparison with some literature.",
    },
    {
      componenType: "h4",
      data: "1. Introduction",
    },
    {
      componenType: "Paragraph",
      data: "Time delay arising in a genetic regulatory network may cause the instability. This paper is concerned with the stability analysis of genetic regulatory networks with interval time-varying delays. Firstly, a relaxed double integral inequality, named as Wirtinger-type double integral inequality (WTDII), is established to estimate the double integral term appearing in the derivative of Lyapunov-Krasovskii functional with a triple integral term. And it is proved theoretically that the proposed WTDII is tighter than the widely used Jensen-based double inequality and the recently developed Wiringter-based double inequality. Then, by applying the WTDII to the stability analysis of a delayed genetic regulatory network, together with the usage of useful information of regulatory functions, several delay-range- and delay-rate-dependent (or delay-rate-independent) criteria are derived in terms of linear matrix inequalities. Finally, an example is carried out to verify the effectiveness of the proposed method and also to show the advantages of the established stability criteria through the comparison with some literature.",
    },
    {
      componenType: "Image",
      data: "https://learn-biology.com/wp-content/uploads/2018/12/04_1920px-Insulin_glucose_metabolism_w-numbers-and-labels-1024x572.png",
      altText: "None",
    },
    {
      componenType: "Paragraph",
      data: "Time delay arising in a genetic regulatory network may cause the instability. This paper is concerned with the stability analysis of genetic regulatory networks with interval time-varying delays. Firstly, a relaxed double integral inequality, named as Wirtinger-type double integral inequality (WTDII), is established to estimate the double integral term appearing in the derivative of Lyapunov-Krasovskii functional with a triple integral term. And it is proved theoretically that the proposed WTDII is tighter than the widely used Jensen-based double inequality and the recently developed Wiringter-based double inequality. Then, by applying the WTDII to the stability analysis of a delayed genetic regulatory network, together with the usage of useful information of regulatory functions, several delay-range- and delay-rate-dependent (or delay-rate-independent) criteria are derived in terms of linear matrix inequalities. Finally, an example is carried out to verify the effectiveness of the proposed method and also to show the advantages of the established stability criteria through the comparison with some literature.",
    },
    {
      componenType: "h4",
      data: "2. Problem Formulation and Preliminary",
    },
    {
      componenType: "Image",
      data: "https://learn-biology.com/wp-content/uploads/2018/12/04_cDNA-and-reverse-transcriptase-lettered.png",
      altText: "None",
    },
    {
      componenType: "Paragraph",
      data: "Time delay arising in a genetic regulatory network may cause the instability. This paper is concerned with the stability analysis of genetic regulatory networks with interval time-varying delays. Firstly, a relaxed double integral inequality, named as Wirtinger-type double integral inequality (WTDII), is established to estimate the double integral term appearing in the derivative of Lyapunov-Krasovskii functional with a triple integral term. And it is proved theoretically that the proposed WTDII is tighter than the widely used Jensen-based double inequality and the recently developed Wiringter-based double inequality. Then, by applying the WTDII to the stability analysis of a delayed genetic regulatory network, together with the usage of useful information of regulatory functions, several delay-range- and delay-rate-dependent (or delay-rate-independent) criteria are derived in terms of linear matrix inequalities. Finally, an example is carried out to verify the effectiveness of the proposed method and also to show the advantages of the established stability criteria through the comparison with some literature.",
    },
    {
      componenType: "h4",
      data: "3. Requirements for Good Documentation Practices (GDP)",
    },
    {
      componenType: "Image",
      data: "https://pharmaceuticalindustrydotblog.files.wordpress.com/2021/11/image.png",
      altText: "None",
    },
    {
      componenType: "Paragraph",
      data: "This chapter covers different levels and types of GMP documentation, including paper and electronic records related to manufacturing, testing, packing of pharmaceutical products, APIs, excipients, dietary supplements, food ingredients and medical devices. These documents and records consist of raw data, reports, protocols, procedures, deviations, investigations, batch records, formats, and records related to trainings, equipments and retention for manufacturing and analytical controls. Data integrity should always be given utmost importance which means the extent to which all data is complete, consistent and accurate throughout the data life cycle. Controls should be in place and any data integrity incident, if noticed; an appropriate corrective action should be taken to prevent recurrence of the same. Attempts to cover-up mistakes are considered as ‘data integrity’ issues and should be prohibited at all levels.",
    },
    {
      componenType: "list",
      numbered:true,
      data: [
        "Production",
        "Quality Assurance",
        "Engineering",
        "Validation and Qualification",
        "Microbiology",
        "Good Manufacturing Practices (GMP)",
        "Quality Control"
      ],
    },
  ],
};

export default function Content() {
  const location = useLocation().pathname;
  const preventDefaultDelegate = (e: any) => {
    e.preventDefault();
  };

  useEffect(() => {
    // Update the document title using the browser API
    // disable right click
    console.log("location is", location);
    if (location !== "/article") {
      document.removeEventListener("contextmenu", preventDefaultDelegate);
    } else {
      document.addEventListener("contextmenu", preventDefaultDelegate);
    }
  });

  return (
    <main className="flex-shrink-0">
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="article" element={<Article data={articleObject} />} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </main>
  );
}
