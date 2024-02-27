const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("node:fs/promises");

const fetchRelics = async () => {
  try {
    const response = await axios.get("https://supersnail.wiki.gg/wiki/Relics");

    const html = response.data;
    const $ = cheerio.load(html);

    const relicRows = $("table.wikitable.sortable tbody tr");

    let promises = [];
    let relics = [];
    let current = 0;
    const max = relicRows.length;
    relicRows.each((_idx, el) => {
      const doTheThing = async () => {
        const $$ = $(el);
        const name = $$.find("td:first").find("a:eq(1)").text();
        const imageUrl = $$.find("td:first")
          .find("a:eq(0)")
          .find("img")
          .attr("src");
        const pageUrl = $$.find("td:first").find("a:eq(1)").attr("href");

        let affct;
        if ($$.hasClass("art")) affct = "art";
        if ($$.hasClass("fame")) affct = "fame";
        if ($$.hasClass("fth")) affct = "faith";
        if ($$.hasClass("civ")) affct = "civ";
        if ($$.hasClass("tech")) affct = "tech";

        let grade;
        if ($$.hasClass("green")) grade = "green";
        if ($$.hasClass("blue")) grade = "blue";
        if ($$.hasClass("a")) grade = "a";
        if ($$.hasClass("aa")) grade = "aa";
        if ($$.hasClass("aaa")) grade = "aaa";
        if ($$.hasClass("s")) grade = "s";
        if ($$.hasClass("ss")) grade = "ss";
        if ($$.hasClass("sss")) grade = "sss";

        let stats = {};
        let skills = [];
        if (grade === "green") {
          if (pageUrl === undefined) return;
          const relicPageResponse = await axios.get(
            `https://supersnail.wiki.gg${pageUrl}`
          );
          const html = relicPageResponse.data;
          const $ = cheerio.load(html);
          $("table tbody tr").each((_idx, el) => {
            const $$ = $(el);
            const stars = $$.find("td:first").text().replace("\n", "");

            if (stars === "★☆☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["1"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["2"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★★") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["3"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }
          });
        }

        if (grade === "blue") {
          if (pageUrl === undefined) return;
          const relicPageResponse = await axios.get(
            `https://supersnail.wiki.gg${pageUrl}`
          );
          const html = relicPageResponse.data;
          const $ = cheerio.load(html);
          $("table tbody tr").each((_idx, el) => {
            const $$ = $(el);
            const stars = $$.find("td:first").text().replace("\n", "");

            if (stars === "★☆☆☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["1"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★☆☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["2"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★★☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["3"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★★★") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["4"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "Awakened") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["Awakened"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }
          });

          $("h2 span#Skills")
            .parent()
            .nextUntil("h2")
            .each((_idx, el) => {
              skills.push({
                skill: $(el).text().replace("\n", ""),
                image: $(el).find("img").attr("src"),
              });
            });
        }

        if (grade === "a" || grade === "aa" || grade === "aaa") {
          if (pageUrl === undefined) return;
          const relicPageResponse = await axios.get(
            `https://supersnail.wiki.gg${pageUrl}`
          );
          const html = relicPageResponse.data;
          const $ = cheerio.load(html);
          $("table tbody tr").each((_idx, el) => {
            const $$ = $(el);
            const stars = $$.find("td:first").text().replace("\n", "");

            if (stars === "★☆☆☆☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["1"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★☆☆☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["2"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★★☆☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["3"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★★★☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["4"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★★★★") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["5"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "Awakened") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["Awakened"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }
          });

          $("h2 span#Skills")
            .parent()
            .nextUntil("h2")
            .each((_idx, el) => {
              skills.push({
                skill: $(el).text().replace("\n", ""),
                image: $(el).find("img").attr("src"),
              });
            });
        }

        if (grade === "s" || grade === "ss" || grade === "sss") {
          if (pageUrl === undefined) return;
          const relicPageResponse = await axios.get(
            `https://supersnail.wiki.gg${pageUrl}`
          );
          const html = relicPageResponse.data;
          const $ = cheerio.load(html);
          $("table tbody tr").each((_idx, el) => {
            const $$ = $(el);
            const stars = $$.find("td:first").text().replace("\n", "");

            if (stars === "★☆☆☆☆☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["1"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★☆☆☆☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["2"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★★☆☆☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["3"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★★★☆☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["4"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★★★★☆") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["5"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "★★★★★★") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["6"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }

            if (stars === "Awakened") {
              const fame = $$.find("td:eq(1)").text().replace("\n", "");
              const art = $$.find("td:eq(2)").text().replace("\n", "");
              const faith = $$.find("td:eq(3)").text().replace("\n", "");
              const civ = $$.find("td:eq(4)").text().replace("\n", "");
              const tech = $$.find("td:eq(5)").text().replace("\n", "");
              const special = $$.find("td:eq(6)")
                .html()
                .replace("\n", "")
                .split("<br>");
              stats["Awakened"] = {
                fame,
                art,
                faith,
                civ,
                tech,
                special,
              };
            }
          });

          $("h2 span#Skills")
            .parent()
            .nextUntil("h2")
            .each((_idx, el) => {
              skills.push({
                skill: $(el).text().replace("\n", ""),
                image: $(el).find("img").attr("src"),
              });
            });
        }

        relics.push({
          name,
          imageUrl,
          pageUrl,
          affct,
          grade,
          stats,
          skills,
        });
      };
      promises.push(
        doTheThing().then(() => {
          current += 1;
          console.log(`done with ${current} out of ${max}`);
        })
      );
    });
    await Promise.allSettled(promises);
    console.log("Done!");
    await fs.writeFile("data/relics.json", JSON.stringify(relics));
  } catch (error) {
    throw error;
  }
};

// Print all tags in the console
fetchRelics();
