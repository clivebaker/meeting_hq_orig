class OrganisationsController < ApplicationController
  before_action :set_organisation, only: %i[ show edit update destroy ]

  # GET /organisations or /organisations.json
  def index
    @organisations = Organisation.joins(:organisation_users).where("organisation_users.user_id = ?", current_user.id)
  end

  # GET /organisations/1 or /organisations/1.json
  def show
  end


  def invite
    @organisation = Organisation.find(params[:organisation_id])
  end
  

  def send_invite
    @organisation = Organisation.find(params[:organisation_id])
    
    if @organisation.user_ids.include?(current_user.id) # check if this user belongs to the organisation you are sharing

      invited_user = User.find_or_create_by(email: params[:invite_email])
      organisation_user = OrganisationUser.new(
        user_id: invited_user.id,
        organisation_id: @organisation.id, 
        invited: true
      )


    end


    respond_to do |format|
      if organisation_user.save
        format.html { redirect_to organisation_url(@organisation), notice: "#{params[:invite_email]} has been invited to the #{@organisation.name} successfully." }
      else
        format.html { render :invite, status: :unprocessable_entity, alert: 'Cannot save' }
      end
    end

  end
  

  # GET /organisations/new
  def new
    @organisation = Organisation.new
  end

  # GET /organisations/1/edit
  def edit
  end

  # POST /organisations or /organisations.json
  def create
    @organisation = Organisation.new(organisation_params)
    

    respond_to do |format|
      if @organisation.save
        binding.pry
        @organisation.users << current_user
        format.html { redirect_to organisation_url(@organisation), notice: "Organisation was successfully created." }
        format.json { render :show, status: :created, location: @organisation }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @organisation.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /organisations/1 or /organisations/1.json
  def update
    respond_to do |format|
      if @organisation.update(organisation_params)
        format.html { redirect_to organisation_url(@organisation), notice: "Organisation was successfully updated." }
        format.json { render :show, status: :ok, location: @organisation }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @organisation.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /organisations/1 or /organisations/1.json
  def destroy
    @organisation.destroy

    respond_to do |format|
      format.html { redirect_to organisations_url, notice: "Organisation was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_organisation
      @organisation = Organisation.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def organisation_params
      params.require(:organisation).permit(:name)
    end
end
