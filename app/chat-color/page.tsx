"use client";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import {
  ButtonGroup,
  Radio,
  RadioGroup,
  RadioProps,
  cn,
} from "@nextui-org/react";
import { useState } from "react";

import styles from "./styles.module.css";

const CustomRadio = (props: RadioProps) => {
  const { children, ...otherProps } = props;
  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn("rounded-lg", "m-1", "bg-current"),
        label: cn("text-black"),
      }}
    >
      {children}
    </Radio>
  );
};

const colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple"];
const colorTagRegex = new RegExp(`\\[(${colors.join("|")})\\]`, "g");
const spacesOnlyRegex = new RegExp(/^\s*$/);
const endTag = "[-]";
const endSpan = "</span>";
const customColorMap: { [key: string]: string } = {
  "normal-bubble": "rgb(236,236,221)",
  "whale-power-i": "rgb(220,233,234)",
  "whale-power-ii": "rgb(243,231,196)",
};

function tagRainbow(string: string): string {
  const splitter = string.includes(" ") ? " " : "";
  let colorIndex = -1;
  const tagged = string.split(splitter).map((segment) => {
    if (spacesOnlyRegex.test(segment)) return segment;
    colorIndex = (colorIndex + 1) % colors.length;
    return colorTag(colors[colorIndex], segment);
  });
  return tagged.join(splitter);
}

function tagSpanRainbow(string: string): string {
  const splitter = string.includes(" ") ? " " : "";
  let colorIndex = -1;
  const tagged = string.split(splitter).map((segment) => {
    if (spacesOnlyRegex.test(segment)) return segment;
    colorIndex = (colorIndex + 1) % colors.length;
    return colorSpan(colors[colorIndex], segment);
  });
  return tagged.join(splitter);
}

function colorTag(color: string, string: string): string {
  if (color === "rainbow") return tagRainbow(string);
  if (Object.keys(customColorMap).includes(color))
    return `[${customColorMap[color]}]${stripTags(string)}${endTag}`;
  return `[${color}]${stripTags(string)}${endTag}`;
}

function colorSpan(color: string, string: string): string {
  if (color === "rainbow") return tagSpanRainbow(string);
  if (Object.keys(customColorMap).includes(color))
    return `<span class="${styles[`${color}-text`]}">${stripTags(
      string
    )}${endSpan}`;
  return `<span class="${styles[`${color}-text`]}">${stripTags(
    string
  )}${endSpan}`;
}

function stripTags(string: string): string {
  const newString = string
    .replaceAll(colorTagRegex, "")
    .replaceAll(endTag, "");
  return newString;
}

export default function ChatColor() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("red");
  const [bubbleColor, setBubbleColor] = useState("normal-bubble");
  const [formattedText, setFormattedText] = useState("");
  const [previewText, setPreviewText] = useState({
    __html:
      "<span>Type your chat message here, then select any part of it and press a color button.</span>",
  });

  const handleClearText = () => {
    setText("");
    setFormattedText("");
    setPreviewText({
      __html:
        "<span>Type your chat message here, then select any part of it and press a color button.</span>",
    });
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(formattedText);
  };

  const handleTextUpdate = (value: string) => {
    setText(value);
    const formattedText = colorTag(color, value);
    setFormattedText(formattedText);
    const previewText = colorSpan(color, value);
    setPreviewText({
      __html: previewText,
    });
  };

  const handleColorUpdate = (value: string) => {
    setColor(value);
    const formattedText = colorTag(value, text);
    setFormattedText(formattedText);
    const previewText = colorSpan(value, text);
    setPreviewText({
      __html: previewText,
    });
  };

  const handleBubbleColorUpdate = (value: string) => {
    setBubbleColor(value);
  };

  return (
    <>
      <h1>Snail Chat Color Tool</h1>
      <ButtonGroup>
        <Button onPress={handleClearText}>Clear text</Button>
        <Button onPress={handleCopyText}>Copy text</Button>
      </ButtonGroup>
      <Textarea
        className="textBox"
        id="inputBox"
        placeholder="Type your chat message here, then select any part of it and press a color button."
        value={text}
        onValueChange={handleTextUpdate}
      ></Textarea>
      <h2>Text Color</h2>
      <RadioGroup
        orientation="horizontal"
        value={color}
        onValueChange={handleColorUpdate}
      >
        <CustomRadio className={styles["red-text"]} value="red">
          Red
        </CustomRadio>
        <CustomRadio className={styles["orange-text"]} value="orange">
          Orange
        </CustomRadio>
        <CustomRadio className={styles["yellow-text"]} value="yellow">
          Yellow
        </CustomRadio>
        <CustomRadio className={styles["green-text"]} value="green">
          Green
        </CustomRadio>
        <CustomRadio className={styles["cyan-text"]} value="cyan">
          Cyan
        </CustomRadio>
        <CustomRadio className={styles["blue-text"]} value="blue">
          Blue
        </CustomRadio>
        <CustomRadio className={styles["purple-text"]} value="purple">
          Purple
        </CustomRadio>
        <CustomRadio className={styles["normal-bubble-text"]} value="rainbow">
          Rainbow
        </CustomRadio>
        <CustomRadio
          className={styles["normal-bubble-text"]}
          value="normal-bubble"
        >
          Normal Bubble
        </CustomRadio>
        <CustomRadio
          className={styles["whale-power-i-text"]}
          value="whale-power-i"
        >
          Whale Power I
        </CustomRadio>
        <CustomRadio
          className={styles["whale-power-ii-text"]}
          value="whale-power-ii"
        >
          Whale Power II
        </CustomRadio>
      </RadioGroup>
      <h2>Chat bubble color</h2>
      <RadioGroup
        orientation="horizontal"
        value={bubbleColor}
        onValueChange={handleBubbleColorUpdate}
      >
        <CustomRadio
          className={`${styles["normal-bubble"]} text-black`}
          value="normal-bubble"
        >
          Normal Bubble
        </CustomRadio>
        <CustomRadio
          className={`${styles["whale-power-i"]} text-black`}
          value="whale-power-i"
        >
          Whale Power I
        </CustomRadio>
        <CustomRadio
          className={`${styles["whale-power-ii"]} text-black`}
          value="whale-power-ii"
        >
          Whale Power II
        </CustomRadio>
      </RadioGroup>
      <Textarea
        disabled
        id="chatPreview"
        placeholder="Type your chat message here, then select any part of it and press a color button."
        value={formattedText}
      ></Textarea>
      <div
        className={cn(
          styles[bubbleColor],
          "rounded-lg",
          "p-4",
          "m-4",
          "text-black"
        )}
        dangerouslySetInnerHTML={previewText}
      ></div>
    </>
  );
}
