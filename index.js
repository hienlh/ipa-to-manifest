const core = require("@actions/core");
const github = require("@actions/github");
const pkgReader = require("reiko-parser");
const fs = require("fs");
const { manifestContentMaker } = require("./manifest");
const FileType = require("file-type");

const main = async () => {
  const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split("/");

  const tagName = github.context.ref;

  const tag = tagName.replace("refs/tags/", "");

  const ipaPath = core.getInput("ipaPath");

  const fileName = ipaPath.split(".")[0];

  const uploadUrl = `https://github.com/${repoOwner}/${repoName}/releases/download/${tag}`;

  const iconPath = fileName + ".png";
  const manifestPath = fileName + ".plist";

  console.log((await uploadFile(ipaPath)).data.value);

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

/**
 *
 * @param {String} filePath
 */
const uploadFile = async (filePath) => {
  const octokit = new github.getOctokit(process.env.GITHUB_TOKEN);
  const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split("/");

  const tagName = github.context.ref;

  const tag = tagName.replace("refs/tags/", "");

  const fileName = filePath.split(".")[0].split("/").pop();
  console.log(
    (
      await octokit.repos.getReleaseByTag({
        repoOwner,
        repoName,
        tag,
      })
    ).data
  );

  const data = {
    url: (
      await octokit.repos.getReleaseByTag({
        repoOwner,
        repoName,
        tag,
      })
    ).data.upload_url,
    headers: {
      "content-type": (await FileType.fromFile(filePath)).mime,
      "content-length": fs.statSync(filePath).size,
    },
    name: fileName,
    file: fs.readFileSync(filePath),
  };
  console.log(data);
  return await octokit.repos.uploadReleaseAsset(data);
};

main().catch((e) => {
  core.setFailed(e);
});
