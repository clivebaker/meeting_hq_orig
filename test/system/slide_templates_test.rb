require "application_system_test_case"

class SlideTemplatesTest < ApplicationSystemTestCase
  setup do
    @slide_template = slide_templates(:one)
  end

  test "visiting the index" do
    visit slide_templates_url
    assert_selector "h1", text: "Slide templates"
  end

  test "should create slide template" do
    visit slide_templates_url
    click_on "New slide template"

    fill_in "Content", with: @slide_template.content
    check "Enabled" if @slide_template.enabled
    fill_in "Name", with: @slide_template.name
    fill_in "Organisation", with: @slide_template.organisation_id
    click_on "Create Slide template"

    assert_text "Slide template was successfully created"
    click_on "Back"
  end

  test "should update Slide template" do
    visit slide_template_url(@slide_template)
    click_on "Edit this slide template", match: :first

    fill_in "Content", with: @slide_template.content
    check "Enabled" if @slide_template.enabled
    fill_in "Name", with: @slide_template.name
    fill_in "Organisation", with: @slide_template.organisation_id
    click_on "Update Slide template"

    assert_text "Slide template was successfully updated"
    click_on "Back"
  end

  test "should destroy Slide template" do
    visit slide_template_url(@slide_template)
    click_on "Destroy this slide template", match: :first

    assert_text "Slide template was successfully destroyed"
  end
end
