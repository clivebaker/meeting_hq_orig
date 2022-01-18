require "test_helper"

class MeetingActionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @meeting_action = meeting_actions(:one)
  end

  test "should get index" do
    get meeting_actions_url
    assert_response :success
  end

  test "should get new" do
    get new_meeting_action_url
    assert_response :success
  end

  test "should create meeting_action" do
    assert_difference("MeetingAction.count") do
      post meeting_actions_url, params: { meeting_action: { meeting_id: @meeting_action.meeting_id, name: @meeting_action.name, note: @meeting_action.note, position: @meeting_action.position, state: @meeting_action.state, user_id: @meeting_action.user_id } }
    end

    assert_redirected_to meeting_action_url(MeetingAction.last)
  end

  test "should show meeting_action" do
    get meeting_action_url(@meeting_action)
    assert_response :success
  end

  test "should get edit" do
    get edit_meeting_action_url(@meeting_action)
    assert_response :success
  end

  test "should update meeting_action" do
    patch meeting_action_url(@meeting_action), params: { meeting_action: { meeting_id: @meeting_action.meeting_id, name: @meeting_action.name, note: @meeting_action.note, position: @meeting_action.position, state: @meeting_action.state, user_id: @meeting_action.user_id } }
    assert_redirected_to meeting_action_url(@meeting_action)
  end

  test "should destroy meeting_action" do
    assert_difference("MeetingAction.count", -1) do
      delete meeting_action_url(@meeting_action)
    end

    assert_redirected_to meeting_actions_url
  end
end
