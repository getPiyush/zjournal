export default function Article() {
  return (
    <div className="container disable-text-selection">
      <h1 className="mt-5">Article Topic Header</h1>
      <p className="lead">
        <img
          className="img-fluid"
          alt="Responsive image"
          src="      https://learn-biology.com/wp-content/uploads/2018/12/05a_genetic-engineering-overview-lettered.png
          "
        />
        <h4>Abstract</h4> Time delay arising in a genetic regulatory network may
        cause the instability. This paper is concerned with the stability
        analysis of genetic regulatory networks with interval time-varying
        delays. Firstly, a relaxed double integral inequality, named as
        Wirtinger-type double integral inequality (WTDII), is established to
        estimate the double integral term appearing in the derivative of
        Lyapunov-Krasovskii functional with a triple integral term. And it is
        proved theoretically that the proposed WTDII is tighter than the widely
        used Jensen-based double inequality and the recently developed
        Wiringter-based double inequality. Then, by applying the WTDII to the
        stability analysis of a delayed genetic regulatory network, together
        with the usage of useful information of regulatory functions, several
        delay-range- and delay-rate-dependent (or delay-rate-independent)
        criteria are derived in terms of linear matrix inequalities. Finally, an
        example is carried out to verify the effectiveness of the proposed
        method and also to show the advantages of the established stability
        criteria through the comparison with some literature.
        <h4>1. Introduction</h4>
        In the past few years, genetic regulatory networks (GRNs), which
        describe the interactions of many molecules (DNA, RNA, proteins, etc.),
        have been becoming a new research area of biological and biomedical
        sciences [1–4]. Mathematical modelling based on the extracted functional
        information from the time-series data provides a useful tool for
        studying gene regulation processes in living organisms [5, 6], and a
        large variety of formalisms have been proposed to model and simulate
        GRNs, such as directed graphs, Boolean networks, and nonlinear
        differential equations [7]. Among them, the nonlinear differential
        equation model can provide more detailed understanding and insights into
        the nonlinear dynamical behavior exhibited by GRNs [8].
        <img
          className="img-fluid"
          alt="Responsive image"
          src="https://learn-biology.com/wp-content/uploads/2018/12/04_1920px-Insulin_glucose_metabolism_w-numbers-and-labels-1024x572.png"
        />
        Since mRNAs and proteins in the GRNs may be synthesized at different
        locations, an important issue in modelling GRNs is that the slow
        processes of transcription, translation, and translocation result in
        sizable delays [9–11]. Time delays arising in the GRNs may lead to wrong
        prediction of dynamic behaviors [12, 13], which may lead to very serious
        consequences. The stability is essential for designing or controlling
        genetic regulatory networks [14]; it is of a great significance to study
        the influence of delays on the stability of the GRNs. Up to now, a huge
        number of results on the stability of the delayed GRNs have been
        reported in the literature (see, e.g., [15–58]).
        <img
          className="img-fluid"
          alt="Responsive image"
          src="https://pharmaceuticalindustrydotblog.files.wordpress.com/2021/12/1640447206497.jpg?w=2048"
        />
        The sufficient and necessary local stability criteria were firstly given
        for the GRNs with constant delay in [15, 16]. However, local stability
        is not enough for understanding nonlinear GRNs; the globally
        asymptotical stability of GRNs with SUM regulatory functions has been
        widely investigated [17–22]. Meanwhile, by taking into account the
        unavoidable uncertainties caused by modelling errors and parameter
        fluctuations, many scholars paid attentions to the robust stability
        analysis of the delayed GRNs [23–36]. Moreover, both the intrinsic noise
        derived from the random births and deaths of individual molecules and
        the extrinsic noise due to environment fluctuations make the gene
        regulation process an intrinsically noisy process [59]. Thus, many
        researches aimed at the robust stability analysis of the GRNs in
        consideration of those noises [37–46]. Also, some results have
        considered both the uncertainties and the noises [47–52]. In addition,
        based on the definition of convergence rate index, the exponential
        stability problem was also studied in [53–57]. On the other hand, no
        matter what type of stability problems is concerned, the analysis
        methods for finding stability criteria have always been an important
        topic. To the best of the authors’ knowledge, there are mainly two
        methods that have been used for the delayed GRNs. The first type of
        method is the -matrix-based method. For example, the delay- and
        rate-independent stability criteria were proposed in [20], the
        delay-independent but rate-dependent criteria were established in [23,
        44], and the delay- and rate-dependent criteria were developed in [21,
        22]. The stability of the GRNs through those -matrix-based criteria is
        judged by verifying whether or not a matrix is a nonsingular -matrix.
        Although the computational complexity is low, those criteria are just
        available for slow-varying delay case [20–23, 44]. However, the time
        delays encountered in GRNs may be fast-varying or random changing. The
        -matrix-based method is inapplicable for those cases. The second type of
        method is based on the framework of Lyapunov-Krasovskii functional (LKF)
        and linear matrix inequality (LMI). The LKF-based method can be used to
        handle all time delays mentioned before and it is available for not only
        stability analysis but also many other problems, like controller
        synthesis, state estimation, filter design, passivity analysis, and so
        on [13, 59–70]. Meanwhile, the LMI-based criteria can be easily checked
        through MATLAB/LMI toolbox for determining the system stability.
        Therefore, most existing researches for the GRNs are based on this type
        of method [17–19, 25–43, 45–56]. The problem of stability analysis by
        using the LKF and the LMI is that the criterion obtained has more or
        less conservatism. It is well-known that the criterion with less
        conservatism means that it can derive an admissible maximum upper bound
        such that the understudied GRNs maintains global asymptotical stability.
        It is predictable that the form of the LKF candidate is tightly related
        to the conservatism of the obtained criteria. Thus, the key point of the
        stability analysis based on such framework is to find an LKF satisfying
        some requirements for ensuring the globally asymptotical stability of
        the GRNs. In most researches, the used LKFs were constructed by
        introducing delay-based single and/or double integral terms into the
        typical nonintegral quadratic form of Lyapunov function for delay-free
        systems [17, 18, 28–33, 35–42, 46–50, 53–55]. Based on a predictable
        fact that the conservatism-reducing of criteria can be achieved by
        constructing more general LKF, two types of more general LKFs have been
        developed to reduce the conservatism. The first one is the
        delay-partition-based LKFs, which is constructed by dividing the delay
        interval into several small subintervals and then replacing the original
        integral terms with multiple new integral terms based on delay
        subintervals. This type of LKF has been used to investigate the robust
        stability of various GRNs [25, 26, 51], the exponential stability of
        switch GRNs [56], and the stochastic stability of jumping GRNs [27, 43,
        45]. The other is the augmented LKF constructed by using various state
        vectors (current and delayed and/or integrated state vectors, etc.) to
        augment the quadratic terms of original LKFs, and it has been used to
        derive the improved stability criteria of the GRNs [19, 34, 52]. Beside
        the above-mentioned two types of improved LKFs, a new LKF including
        triple integral terms firstly developed in [71] is proved to be very
        useful to reduce the conservatism. However, only a few researches of the
        GRNs have applied such type of LKF. The LKF with triple integral terms
        was used to discuss the asymptotical stability of the GRNs [19, 34]. The
        following form of double integral term will be introduced into the
        derivative of the LKF with a triple integral term: As mentioned in [72],
        the effective estimation of the above term is strongly linked to the
        conservatism of the criteria. To the best of the authors’ knowledge, for
        the researches referring to the triple integral term in the LKFs, most
        literature directly applied the Jensen-based double integral inequality
        (JBDII) (see (17) for details) to achieve the estimation task [34].
        Although an improved integral inequality was developed in [19], it is
        also derived based on Jensen inequality. Very recently, a
        Wirtinger-based double integral inequality (WBDII) was developed to
        general linear time-delay system and it was proved to be less
        conservative than the JBDII [72]. However, such inequality has not been
        used to discuss the GRNs. Furthermore, the gap between term (1) and its
        estimated value obtained by the WBDII still leads to conservatism.
        Therefore, it can be expected that the results may be further improved
        if a new estimation method that brings tighter gap is applied for term
        (1). This is the motivation of the paper. This paper further
        investigates the delay-dependent stability of the GRNs by developing a
        more effective inequality to estimate the double integral term (1). The
        contributions of the paper are summarized as follows: (1) A relaxed
        double integral inequality, that is, Wiringter-type double integral
        inequality (WTDII), is established to estimate the double integral term.
        Compared with the widely used JBDII and the recently developed WTDII,
        the presented WTDII is theoretically proved to be the tightest. (2) Two
        less conservative stability criteria of the GRNs are derived. For the
        GRNs with time-varying delays satisfying different conditions, two
        stability criteria are, respectively, established by applying the
        proposed WTDII to estimate the double integral terms appearing in the
        derivative of the LKFs. The rest of the paper is organized as follows.
        Problem statements and preliminaries are presented in Section 2. In
        Section 3, the development and the comparison of the WTDII approach are
        discussed in detail. Two stability criteria of the GRN with time-varying
        delay are derived through the WTDII in Section 4. An example is given to
        show the validity of the obtained results in Section 5. Finally, in
        Section 6, the conclusions are drawn. In the Notations, the list of
        notations and abbreviations used throughout this paper is shown.
        <h4>2. Problem Formulation and Preliminary</h4>
        <img
          className="img-fluid"
          alt="Responsive image"
          src="https://learn-biology.com/wp-content/uploads/2018/12/01b_restriction-enzyme-HindIII-bigger-letters.png
          "
        />
        This section describes the problem to be investigated and gives some
        necessary preliminaries. 2.1. Problem Formulation The following
        nonlinear differential equations have been used recently to describe the
        GRNs with time-varying feedback regulation delays and translational
        delays [28]: as shown in Figure 1, where and are the concentrations of
        the th mRNA and protein, respectively. and are the positive real numbers
        that represent the degradation rate of the th mRNA and protein,
        respectively. is the positive real number that represents the
        translating rate from mRNA to protein . is the regulatory function of
        the th gene. and are the transcriptional and translational delays,
        respectively. Figure 1 GRNs with time-varying feedback regulation delays
        and translational delays. Since each transcription factor acts
        additively to regulate the gene, it is usual to assume that the
        regulatory function satisfies the following SUM logic [37]: and is a
        monotonic function of the Hill form; that is, where is bounded constant
        that denotes the dimensionless transcriptional rate of transcription
        factor to gene ,   is a positive scalar, and is the Hill coefficient
        that represents the degree of cooperativity. The transcriptional and
        translational delays, and , are assumed to satisfy the following two
        different conditions. Case 1. and satisfy Case 2. and satisfy Clearly,
        based on (3), GRN (2) can be rewritten as [19] where with being the set
        of all the transcription factors which are repressors of gene ; if
        transcription factor activates gene ,   if there is no connection
        between and , and if transcription factor represses gene ; and ,   is a
        monotonically increasing function satisfying with and GRN (7) can be
        expressed as the following vector-matrix form: where ,  ,  ,  ,  ,  ,  ,
        and . Let be the equilibrium point (steady state) of (10); that is, and
        . Using the transformations and , one can shift the equilibrium point to
        the origin and rewrite (10) as the following GRN: where and with . Then,
        Thus, it follows from (8) and that This paper aims to analyze the
        asymptotical stability of GRN (2) and to determine the delay bounds,
        named as maximal admissible delay bounds (MADBs), under which the GRN is
        asymptotically stable. In order to achieve this aim, this paper will
        develop a new double integral inequality (i.e., WTDII) for estimating
        the double integral term (1) so as to derive some less conservative
        stability criteria. 2.2. Preliminaries Several lemmas used to obtain the
        main results are given as follows. For the estimation of single integral
        term, the most popular technique is Wirtinger-based inequality, shown as
        Lemma 1. Lemma 1 (Wirtinger-based inequality [73]). For symmetric
        positive-definite matrix , scalars , and vector such that the
        integration concerned is well defined, the following inequality holds:
        where and . The auxiliary function-based integral inequality, which
        encompasses the Wirtinger-based inequality, has been developed in recent
        years.
        <img
          className="img-fluid"
          alt="Responsive image"
          src="https://pharmaceuticalindustrydotblog.files.wordpress.com/2021/11/image.png"
        />
        Lemma 2 (auxiliary function-based integral inequality [74]). For
        symmetric positive-definite matrix , scalars , and vector such that the
        integration concerned is well defined, the following inequality holds
        where ,  , and . For the estimation of double integral term, the JBDII
        is widely applied in [71], and, with its improvement, the WBDII was
        developed in [72] very recently, respectively shown as Lemmas 3 and 4.
        Lemma 3 (Jensen-based double integral inequality (JBDII) [71]). For
        symmetric positive-definite matrix , scalars , and vector such that the
        integration concerned is well defined, the following inequality holds:
        where . Lemma 4 (Wirtinger-based double integral inequality (WBDII)
        [72]). For symmetric positive-definite matrix , scalars , and vector
        such that the integration concerned is well defined, the following
        inequality holds: where with given in Lemma 3. For time-varying delay,
        when using the integral inequality, the reciprocally convex lemma is
        needed, and its simple form can be reformulated as Lemma 5. Lemma 5
        (reciprocally convex combination lemma [75]). For any vectors and ,
        symmetric matrix , any matrix , and real scalar satisfying , the
        following inequality holds:
        <h4>3. A Relaxed Double Integral Inequality and Its Advantages</h4>
        <img
          className="img-fluid"
          alt="Responsive image"
          src="https://learn-biology.com/wp-content/uploads/2020/06/restriction-enzymes-ligases-recombinant-DNA-sciencemusicvideos-biorender-e1592079571812.png
          "
        />
        This section develops a new integral inequality, that is, the WTDII, to
        estimate the double integral terms existing. The comparison of the WTDII
        and the existing double integral inequalities is also given. Based on
        the technique of integral in parts, the following WTDII is given. Lemma
        6. For symmetric positive-definite matrix , scalars , and vector such
        that the integration concerned is well defined, the following inequality
        holds: where and are defined in Lemmas 3 and 4. Proof. For a function ,
        the calculation through integration by parts leads to By setting ,  ,
        that is, , the above equality is rewritten as Then the following
        equality is obtained for any vector and any matrix : Similarly, the
        following equalities are derived: Therefore, using the above five
        equalities and the Schur complement derives the following equality: By
        letting ,  , and , that is, and , then (25) leads to Thus (20) holds.
        This completes the proof. Remark 7. Based on the comparison of the
        proposed WTDII (20) with the widely used JBDII (17) and the recently
        developed WBDII (18), it can be found that WTDII (20) provides the
        tightest estimation value of the double integral term (1). More
        specifically, compared with the widely used JBDII (17), the extra
        positive term reduces the gap between the original double integral term
        (1) and its estimated value; and, compared with the recently developed
        WBDII (18), the extra positive term reduces the estimation gap. As
        mentioned in [72–74], it is helpful to reduce the conservatism by
        reducing such estimation gap. Therefore, the proposed WTDII (20) will
        lead to less conservative criteria than the ones derived by JBDII (17)
        [19] or WBDII (18). By setting , the following lemma can be directly
        obtained from Lemma 6. Lemma 8. For symmetric positive-definite matrix ,
        scalars , and vector such that the integration concerned is well
        defined, the following inequality holds: where and .
        <h4>4. Delay-Dependent Stability Analysis of GRN</h4>
        <img
          className="img-fluid"
          alt="Responsive image"
          src="        https://learn-biology.com/wp-content/uploads/2018/12/04_cDNA-and-reverse-transcriptase-lettered.png
          "
        />
        This section derives delay-dependent stability criteria of GRN (2) by
        constructing the LKF with triple integral terms and applying the
        proposed WTDII (20) to estimate the double integral terms appearing in
        its derivative. The following notations are introduced at first for
        simplifying the representation of subsequent parts: 4.1. Stability of
        GRN (2) with Delay Satisfying (5) For GRN (2) with a delay satisfying
        (5), the following stability criterion is derived by using the proposed
        WTDII (27), together with Lemmas 1, 2, and 5, to estimate the derivative
        of the LKF. Theorem 9. For given scalars ,  ,  , and , GRN (2) with the
        time delay satisfying (5) and regulatory function satisfying (3) is
        asymptotically stable, if there exist symmetric matrices
      </p>
    </div>
  );
}
