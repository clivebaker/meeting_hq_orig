require "application_system_test_case"

class MasterSlideTemplatesTest < ApplicationSystemTestCase
  setup do
    @master_slide_template = master_slide_templates(:one)
  end

  test "visiting the index" do
    visit master_slide_templates_url
    assert_selector "h1", text: "Master slide templates"
  end

  test "should create master slide template" do
    visit master_slide_templates_url
    click_on "New master slide template"

    fill_in "Content", with: @master_slide_template.content
    check "Enabled" if @master_slide_template.enabled
    fill_in "Name", with: @master_slide_template.name
    click_on "Create Master slide template"

    assert_text "Master slide template was successfully created"
    click_on "Back"
  end

  test "should update Master slide template" do
    visit master_slide_template_url(@master_slide_template)
    click_on "Edit this master slide template", match: :first

    fill_in "Content", with: @master_slide_template.content
    check "Enabled" if @master_slide_template.enabled
    fill_in "Name", with: @master_slide_template.name
    click_on "Update Master slide template"

    assert_text "Master slide template was successfully updated"
    click_on "Back"
  end

  test "should destroy Master slide template" do
    visit master_slide_template_url(@master_slide_template)
    click_on "Destroy this master slide template", match: :first

    assert_text "Master slide template was successfully destroyed"
  end
end
