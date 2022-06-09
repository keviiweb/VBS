import { danger, fail, warn } from 'danger';
import { readFileSync } from 'fs';

const PR = danger.github.pr;
const MODIFIED_FILES = danger.git.modified_files;
const CREATED_FILES = danger.git.created_files;
const FILES = [...MODIFIED_FILES, ...CREATED_FILES];
const BIG_PR_CODE_THRESHOLD = 600;
const BIG_PR_FILE_THRESHOLD = 15;

// -- PR into main branch -------------------------------------------------------------- //
if (PR.base.ref === 'main') {
  // Check for big PRs
  if (
    PR.additions + PR.deletions > BIG_PR_CODE_THRESHOLD ||
    PR.changed_files > BIG_PR_FILE_THRESHOLD
  ) {
    warn(
      'This looks like a big PR, which is valid in case of many file additions / deletions, but should be avoided for big code changes as it is hard to review',
    );
  }

  // Check for asignees
  if (PR.assignee === null) {
    fail(
      'Please assign someone to merge this PR, and optionally include people who should review.',
    );
  }

  // Check if PR title is set
  if (PR.title.length < 5) {
    fail('Please add better pr title');
  }

  if (PR.body.length < 20) {
    fail('Please add better description');
  }

  // -- SRC_FILES checks ------------------------------------------------------------------ //
  FILES.forEach((file) => {
    const content = readFileSync(file).toString();

    // Check for TODO comment
    if (content.includes('TODO')) {
      fail(`\`TODO\` comment is present in (${file})`);
    }
  });

  const modifiedMD = danger.git.modified_files.join('- ');
  message('Changed Files in this PR: \n - ' + modifiedMD);
} else {
  const modifiedMD = danger.git.modified_files.join('- ');
  message('Changed Files in this PR: \n - ' + modifiedMD);
}
