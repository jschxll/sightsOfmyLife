import { pathToFileURL } from "node:url";
import { evaluate } from "@mdx-js/mdx";
import { renderToStaticMarkup } from "react-dom/server";
import { DateTime } from "luxon";
import * as runtime from "react/jsx-runtime";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";

export default async function (eleventyConfig) {
  eleventyConfig.addExtension("mdx", {
    compile: async (str, inputPath) => {
      const { default: mdxContent } = await evaluate(str, {
        ...runtime,
        baseUrl: pathToFileURL(inputPath),
      });

      return async function (data) {
        let res = await mdxContent(data);
        return renderToStaticMarkup(res);
      };
    },
  });

  eleventyConfig.addFilter("date", (dateObj, format = "dd.MM.yyyy") => {
    return DateTime.fromJSDate(dateObj).toFormat(format);
  });

  eleventyConfig.addCollection("thoughts", function(collectionApi) {
    return collectionApi.getFilteredByTag("thoughts").reverse(); 
  });

  eleventyConfig.addTemplateFormats("mdx");
  eleventyConfig.addPassthroughCopy("src/bundle.css");
  eleventyConfig.addPassthroughCopy("src/img/**/*");
  eleventyConfig.addPassthroughCopy("src/gallery/**/*");
  eleventyConfig.addPassthroughCopy("src/*.js");
  eleventyConfig.addPassthroughCopy("src/fonts/*");

  eleventyConfig.addPlugin(feedPlugin, {
		type: "rss",
		outputPath: "/feed.xml",
		collection: {
			name: "thoughts",
			limit: 0,
		},
		metadata: {
			language: "en",
			title: "Sights of My Life",
			subtitle: "A RSS feed of my content:)",
			base: "https://jschxll.net/",
			author: {
				name: "jschxll",
			}
		}
	});
  
  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
}
