class MeetingActionsController < ApplicationController
  before_action :set_organisation
  before_action :set_business_unit
  before_action :set_meeting
  before_action :set_hosted_meeting
  before_action :set_meeting_action, only: %i[ show edit update destroy ]
  before_action :set_users

  # GET /meeting_actions or /meeting_actions.json
  def index
    @meeting_actions = MeetingAction.where(meeting_id: @meeting.id)
  end

  # GET /meeting_actions/1 or /meeting_actions/1.json
  def show
  end

  # GET /meeting_actions/new
  def new
    @meeting_action = MeetingAction.new
    @meeting_action.meeting_id = @meeting.id
  end

  # GET /meeting_actions/1/edit
  def edit
  end

  # POST /meeting_actions or /meeting_actions.json
  def create
    @meeting_action = MeetingAction.new(meeting_action_params)

    callback_url = organisation_business_unit_meeting_hosted_meeting_url(@organisation, @business_unit, @meeting, @hosted_meeting)
#    callback_url = params[:callback_url] if params[:callback_url].present?


 

    
    respond_to do |format|

      if @meeting_action.save


        format.html { redirect_to callback_url, notice: "Meeting action was successfully created." }
        format.json { render :show, status: :created, location: @meeting_action }
      else
        format.html { redirect_to callback_url, alert: "Action was NOT saved. #{@meeting_action.errors.map{|error| error.full_message}.join(' ')}" }
        format.json { render json: @meeting_action.errors, status: :unprocessable_entity }
      end
    end
  end

  def complete
    @meeting_action = MeetingAction.find(params[:meeting_action_id])
    @meeting_action.close! if @meeting_action.may_close? 
    respond_to do |format|
        format.html { redirect_to organisation_business_unit_meeting_hosted_meeting_url(@organisation, @business_unit, @meeting, @hosted_meeting), notice: "Item was successfully closed." }
    end
  end

  def reopen
    @meeting_action = MeetingAction.find(params[:meeting_action_id])
    @meeting_action.reopen! if @meeting_action.may_reopen? 
    respond_to do |format|
        format.html { redirect_to organisation_business_unit_meeting_hosted_meeting_url(@organisation, @business_unit, @meeting, @hosted_meeting), notice: "Item was successfully opened." }
    end
  end

  # PATCH/PUT /meeting_actions/1 or /meeting_actions/1.json
  def update
      
    callback_url = organisation_business_unit_meeting_hosted_meeting_url(@organisation, @business_unit, @meeting, @hosted_meeting)

    respond_to do |format|
      if @meeting_action.update(meeting_action_params)
        format.html { redirect_to callback_url, notice: "Meeting action was successfully updated." }
        format.json { render :show, status: :ok, location: @meeting_action }
      else
        format.html { redirect_to callback_url, alert: "Meeting action could NOT be updated." }
        format.json { render json: @meeting_action.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /meeting_actions/1 or /meeting_actions/1.json
  def destroy
    @meeting_action.destroy

    respond_to do |format|
      format.html { redirect_to organisation_business_unit_meeting_meeting_actions_url(@organisation, @business_unit, @meeting), notice: "Meeting action was successfully destroyed." }
      format.json { head :no_content }
    end
  end



  def move

    @meeting_action = MeetingAction.find(params[:meeting_action_id])
    direction = params[:direction]
    if direction == 'up'
      @meeting_action.move_higher
    else
      @meeting_action.move_lower
    end

    respond_to do |format|
        format.html { redirect_to organisation_business_unit_meeting_meeting_actions_url(@organisation, @business_unit, @meeting), notice: "Action was successfully moved." }
    end



  end



  private

    def set_users 

      @users = User.joins(:business_unit_users).where('business_unit_users.business_unit_id = ?', @business_unit.id)

    end

    def set_business_unit
      @business_unit = BusinessUnit.find(params[:business_unit_id])
    end
   def set_organisation
      @organisation = Organisation.find(params[:organisation_id])
    end
    def set_meeting
      @meeting = Meeting.find(params[:meeting_id])
    end
    def set_hosted_meeting
      @hosted_meeting = HostedMeeting.find(params[:hosted_meeting_id])
    end
# Use callbacks to share common setup or constraints between actions.
    def set_meeting_action
      @meeting_action = MeetingAction.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def meeting_action_params
      params.require(:meeting_action).permit(:hosted_meeting_id, :action_type, :description)
    end
end
