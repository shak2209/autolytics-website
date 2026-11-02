# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@footer
Feature: Site footer

  @TC-FOOT-001 @regression @priority-medium
  Scenario Outline: TC-FOOT-001: The copyright notice shows the current year
    # Priority: Medium | Type: Functional | Page: All pages
    Given I open the "<page>" page
    Then the footer should show the copyright notice for the current year

    Examples:
      | page |
      | Home |
      | About Me |
      | Services |
      | Experience |

  @TC-FOOT-002 @regression @priority-medium
  Scenario Outline: TC-FOOT-002: The footer LinkedIn link opens in a new tab
    # Priority: Medium | Type: Functional | Page: All pages
    Given I open the "<page>" page
    Then the "LinkedIn" link should open "https://www.linkedin.com/in/shakeel-malik-75149a85/" in a new tab

    Examples:
      | page |
      | Home |
      | About Me |
      | Services |
      | Experience |
