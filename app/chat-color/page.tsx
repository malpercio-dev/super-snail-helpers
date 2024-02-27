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

const CustomRadio = (props: RadioProps) => {
  const { children, ...otherProps } = props;
  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn("rounded-lg", `bg-${otherProps.value ?? "white"}-900`, "m-1"),
      }}
    >
      {children}
    </Radio>
  );
};

const colors = ["red", "orange", "yellow", "green", "cyan", "blue", "purple"];
const colorTagRegex = new RegExp(`\\[(${colors.join("|")})\\]`, "g");
const endTag = "[-]";
function colorTag(color: string, string: string): string {
  return `[${color}]${stripTags(string)}${endTag}`;
}

function stripTags(string: string): string {
  const newString = string.replaceAll(colorTagRegex, "").replaceAll(endTag, "");
  return newString;
}

function createPreview(string: string): string {
  return string
    .replaceAll(
      colorTagRegex,
      (match, color) => `<span class="text-${color}-900">`
    )
    .replaceAll(endTag, "</span>");
}

export default function ChatColor() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("red");
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
    const previewText = createPreview(formattedText);
    setPreviewText({
      __html: previewText,
    });
  };

  const handleColorUpdate = (value: string) => {
    setColor(value);
    const formattedText = colorTag(value, text);
    setFormattedText(formattedText);
    const previewText = createPreview(formattedText);
    setPreviewText({
      __html: previewText,
    });
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
      <RadioGroup
        orientation="horizontal"
        value={color}
        onValueChange={handleColorUpdate}
      >
        <CustomRadio className="bg-red-900" value="red">
          Red
        </CustomRadio>
        <CustomRadio className="bg-orange-900" value="orange">
          Orange
        </CustomRadio>
        <CustomRadio className="bg-yellow-900" value="yellow">
          Yellow
        </CustomRadio>
        <CustomRadio className="bg-green-900" value="green">
          Green
        </CustomRadio>
        <CustomRadio className="bg-cyan-900" value="cyan">
          Cyan
        </CustomRadio>
        <CustomRadio className="bg-blue-900" value="blue">
          Blue
        </CustomRadio>
        <CustomRadio className="bg-purple-900" value="purple">
          Purple
        </CustomRadio>
      </RadioGroup>
      <Textarea
        disabled
        className="chatPreview"
        id="chatPreview"
        placeholder="Type your chat message here, then select any part of it and press a color button."
        value={formattedText}
      ></Textarea>
      <div dangerouslySetInnerHTML={previewText}></div>
    </>
  );
}
