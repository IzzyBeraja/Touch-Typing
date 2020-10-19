import React, { useEffect, useState } from "react";
import { getKeySet } from "keysets/colemak";
import TypeTest from "components/TypeTest";
import ReactMarkdown from "react-markdown";

import { Stat, TestResults } from "types";
import { getTest } from "services/TypeTestService";
import { getMarkdownByName } from "../lib/markdown";
import { GetStaticProps } from "next";
import { getAllStats, saveAllStats } from "../lib/getStats";

type Props = {
  markdown: string;
};

const Practice = ({ markdown }: Props) => {
  const [text, setText] = useState("");
  const [keySet, setKeySet] = useState(getKeySet());
  const [stats, setStats] = useState(getAllStats());

  useEffect(() => {
    const statsFromStorage = getStats();
    setStats(statsFromStorage);
    setText(getTest().text);
    setKeySet(getKeySet());
  }, []);

  const handleTestFinish = (results: TestResults) => {
    const stats = getStatsForRace(results);
    saveAllStats(stats);
    setStats(stats);
    setText(getTest().text);
    setKeySet(getKeySet());
    console.log(stats);
  };

  const getStats = () => {
    return getAllStats();
  };

  const getStatsForRace = ({ answers, startTime, endTime }: TestResults) => {
    const time = (endTime - startTime) / (1000 * 60);
    const avgWordLength = 5;
    const wrongAnswers = answers.filter(a => a === "-").length;
    const rightAnswers = text.length - wrongAnswers;
    const wpm = text.length / avgWordLength / time;
    const score = rightAnswers * 20 - wrongAnswers * 20;
    const accuracy = ((rightAnswers - wrongAnswers) / text.length) * 100;

    const runStats: Stat[] = [
      {
        key: "speed",
        value: { label: "Speed", value: wpm, delta: 0, precision: 1 },
      },
      {
        key: "accuracy",
        value: {
          label: "Accuracy",
          value: accuracy,
          delta: 0,
          precision: 2,
          isPercent: true,
        },
      },
      { key: "score", value: { label: "Score", value: score, delta: 0 } },
    ];

    return runStats;
  };

  return (
    <div className="mx-5 pt-2">
      <TypeTest
        text={text}
        keySet={keySet}
        stats={stats}
        onTestFinish={handleTestFinish}
      />
      <div className="container markdown mt-5">
        <ReactMarkdown source={markdown} />
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const markdown = getMarkdownByName("practice.md").fileContents;
  return {
    props: { markdown },
  };
};

export default Practice;
