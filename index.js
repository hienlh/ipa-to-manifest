const core = require("@actions/core");
const { GitHub, context } = require("@actions/github");
const pkgReader = require("reiko-parser");
const fs = require("fs");
const { manifestContentMaker } = require("./manifest");

const main = async () => {
  const github = new GitHub(process.env.GITHUB_TOKEN);

  const { owner, repo } = context.repo;

  const tagName = context.ref;

  const tag = tagName.replace("refs/tags/", "");

  const getReleaseResponse = await github.repos.getReleaseByTag({
    owner,
    repo,
    tag,
  });

  const {
    data: { upload_url: uploadUrl },
  } = getReleaseResponse;

  const ipaPath = core.getInput("ipaPath");

  const fileName = ipaPath.split(".")[0];

  const iconPath = fileName + ".png";
  const manifestPath = fileName + ".plist";

  const data = new pkgReader(ipaPath, "ipa", { withIcon: true });
  data.parse((err, pkgInfo) => {
    if (err) {
      console.error(err);
    } else {
      console.log(uploadUrl);
      fs.writeFile(iconPath, pkgInfo.icon.split(";base64,").pop(), {
        encoding: "base64",
      });
      fs.writeFile(
        manifestPath,
        manifestContentMaker(ipaPath, {
          iconUrl: iconUrl,
          bundleId: pkgInfo.CFBundleIdentifier,
          title: pkgInfo.CFBundleName,
          version: pkgInfo.CFBundleShortVersionString,
        })
      );

      core.setOutput("manifestPath", manifestPath);
    }
  });
};

main();
