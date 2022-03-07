class MeetingsController < ApplicationController
  before_action :set_organisation
  before_action :set_business_unit
  before_action :set_meeting, only: %i[ show edit update destroy ]

  # GET /meetings or /meetings.json
  def index
    @meetings = Meeting.where(business_unit_id: @business_unit.id)
  end

  # GET /meetings/1 or /meetings/1.json
  def show
  end

  # GET /meetings/new
  def new
    @meeting = Meeting.new
    @meeting.business_unit_id = @business_unit.id
  #  @meeting.organisation_id = @organisation.id
  end

  # GET /meetings/1/edit
  def edit
  end

  # POST /meetings or /meetings.json
  def create
    @meeting = Meeting.new(meeting_params)

    respond_to do |format|
      if @meeting.save
        format.html { redirect_to organisation_url(@organisation), notice: "Meeting was successfully created." }
        format.json { render :show, status: :created, location: @meeting }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @meeting.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /meetings/1 or /meetings/1.json
  def update
    respond_to do |format|
      if @meeting.update(meeting_params)
        format.html { redirect_to organisation_business_unit_meeting_url(@organisation, @business_unit, @meeting), notice: "Meeting was successfully updated." }
        format.json { render :show, status: :ok, location: @meeting }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @meeting.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /meetings/1 or /meetings/1.json
  def destroy
    @meeting.destroy

    respond_to do |format|
      format.html { redirect_to organisation_business_unit_meetings_url(@organisation, @business_unit), notice: "Meeting was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private


    def set_business_unit
      @business_unit = BusinessUnit.find(params[:business_unit_id])
    end
   def set_organisation
      @organisation = Organisation.find(params[:organisation_id])
    end
    
    # Use callbacks to share common setup or constraints between actions.
    def set_meeting
      @meeting = Meeting.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def meeting_params
      params.require(:meeting).permit(:business_unit_id, :name)
    end
end
